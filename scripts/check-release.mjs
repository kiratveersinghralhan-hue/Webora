// Scan only release candidates; never print a matched credential value.
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const staged = process.argv.includes("--staged");
const args = staged
  ? ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]
  : ["ls-files", "--cached", "--others", "--exclude-standard", "-z"];
const files = [
  ...new Set(
    execFileSync("git", args, { encoding: "utf8" }).split("\0").filter(Boolean),
  ),
];
const findings = [];
const patterns = [
  /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/,
  /\b(?:sb_secret_|sk_live_|sk_test_)[A-Za-z0-9_-]{12,}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
];
for (const file of files) {
  if (
    /(?:^|\/)(?:node_modules|dist|test-results|playwright-report)\//.test(
      file,
    ) ||
    (/(?:^|\/)\.env(?:\..*)?$/.test(file) && !file.endsWith(".env.example")) ||
    /\.(?:pem|pfx|p12|key)$/i.test(file)
  ) {
    findings.push(`${file}: excluded build/private file`);
    continue;
  }
  if (
    !/\.(?:tsx?|jsx?|mjs|css|json|md|sql|toml|html|txt|ya?ml|svg)$/.test(
      file,
    ) &&
    !file.endsWith(".env.example") &&
    !file.endsWith(".gitignore")
  )
    continue;
  const text = staged
    ? execFileSync("git", ["show", `:${file}`], { encoding: "utf8" })
    : await readFile(file, "utf8");
  if (patterns.some((pattern) => pattern.test(text)))
    findings.push(`${file}: possible credential material (value redacted)`);
}
if (findings.length) {
  console.error(findings.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Release safety scan passed: ${files.length} ${staged ? "staged" : "candidate"} files; no private environment/build files or credential-pattern matches.`,
  );
