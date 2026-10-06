import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { validLead } from "./fixture";

const db = new PGlite();
const hash = "a".repeat(64);
let leadId: string;
beforeAll(async () => {
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon, authenticated, service_role;",
  );
  await db.exec(
    await readFile(
      "supabase/migrations/20261005162001_webora_enquiries.sql",
      "utf8",
    ),
  );
});
afterAll(() => db.close());
async function intake(
  submission_id = validLead.submission_id,
  rateKey = hash,
  payloadHash = hash,
) {
  const result = await db.query<{
    result: { id?: string; conflict?: boolean; rate_limited?: boolean };
  }>("select public.intake_project_enquiry($1::jsonb, $2, $3) as result", [
    JSON.stringify({ ...validLead, submission_id }),
    rateKey,
    payloadHash,
  ]);
  return result.rows[0].result;
}
describe("database intake and privacy", () => {
  it("commits a lead and both email jobs atomically", async () => {
    await db.exec("set role service_role");
    const result = await intake();
    await db.exec("reset role");
    leadId = result.id!;
    expect(leadId).toBeTruthy();
    const rows = await db.query("select status, source from project_enquiries");
    expect(rows.rows).toEqual([{ status: "new", source: "direct" }]);
    expect(
      (await db.query("select kind from enquiry_email_jobs order by kind"))
        .rows,
    ).toEqual([{ kind: "client" }, { kind: "studio" }]);
  });
  it("retries one submission without duplicating leads or emails", async () => {
    expect((await intake()).id).toBe(leadId);
    expect(
      (
        await db.query<{ count: number }>(
          "select count(*)::int as count from project_enquiries",
        )
      ).rows[0].count,
    ).toBe(1);
    expect(
      (
        await db.query<{ count: number }>(
          "select count(*)::int as count from enquiry_email_jobs",
        )
      ).rows[0].count,
    ).toBe(2);
  });
  it("rejects changed payloads using the same submission id", async () => {
    expect(
      (await intake(validLead.submission_id, hash, "b".repeat(64))).conflict,
    ).toBe(true);
  });
  it("limits a network bucket to five new submissions", async () => {
    for (let i = 0; i < 4; i++)
      expect((await intake(crypto.randomUUID())).id).toBeTruthy();
    expect((await intake(crypto.randomUUID())).rate_limited).toBe(true);
  });
  it("leases email jobs once and recovers expired leases", async () => {
    const first = await db.query(
      "select * from claim_enquiry_emails($1::uuid, 8)",
      [leadId],
    );
    expect(first.rows.length).toBe(2);
    expect(
      (
        await db.query("select * from claim_enquiry_emails($1::uuid, 8)", [
          leadId,
        ])
      ).rows.length,
    ).toBe(0);
    await db.query(
      "update enquiry_email_jobs set lease_until = now() - interval '1 minute' where enquiry_id = $1",
      [leadId],
    );
    expect(
      (
        await db.query("select * from claim_enquiry_emails($1::uuid, 8)", [
          leadId,
        ])
      ).rows.length,
    ).toBe(2);
  });
  it("refuses all public table access and privileged RPC calls", async () => {
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      for (const table of [
        "project_enquiries",
        "enquiry_email_jobs",
        "enquiry_rate_limits",
      ]) {
        await expect(db.query(`select * from ${table}`)).rejects.toThrow(
          /permission denied/,
        );
        await expect(
          db.query(`insert into ${table} default values`),
        ).rejects.toThrow(/permission denied/);
        await expect(db.query(`delete from ${table}`)).rejects.toThrow(
          /permission denied/,
        );
        await expect(
          db.query(
            `update ${table} set ${table === "enquiry_rate_limits" ? "attempts = 1" : "status = 'new'"}`,
          ),
        ).rejects.toThrow(/permission denied/);
      }
      await expect(intake()).rejects.toThrow(/permission denied/);
      await expect(
        db.query("select * from claim_enquiry_emails()"),
      ).rejects.toThrow(/permission denied/);
      await db.exec("reset role");
    }
  });
  it("has RLS enabled on every created table", async () => {
    const result = await db.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class where relname in ('project_enquiries','enquiry_email_jobs','enquiry_rate_limits')",
    );
    expect(result.rows).toHaveLength(3);
    expect(result.rows.every((r) => r.relrowsecurity)).toBe(true);
  });
});
