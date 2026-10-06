# WEBORA V1 enquiry setup — Formspree

React six-step enquiry → AJAX `https://formspree.io/f/{form_id}` → Formspree
submission storage + configured studio email notification → existing Webora
success screen. Visitors stay on Webora. No Supabase or Resend configuration is
required. No real form ID, submission or inbox delivery has been verified here.

## Dashboard and local setup

1. Create/sign into [Formspree](https://formspree.io). Verify your account email.
2. Create a dashboard project named **Webora** and a form named **Project Enquiry**.
3. In **Account → Linked Emails**, add `kiratveersinghralhan@gmail.com` if necessary
   and complete the verification email. In the form's **Workflow → Email** action
   settings, select this verified recipient. If no Email action exists, use
   **+ Add New → Email**. Do not add the studio recipient to the frontend payload.
4. In the form's **Integration** tab, copy its endpoint and take only the ID/hash
   after `/f/`. This is a public submission identifier, not an API/management key.
5. Create `.env.local` in this repository root, using `.env.example` as a guide.
   Set `VITE_FORMSPREE_FORM_ID=` to your actual dashboard ID. Do not paste the
   entire endpoint or any API key. `.env.local` is Git-ignored. No real ID is
   supplied in the example or source.
6. In **Settings → Spam protection**, disable the hosted reCAPTCHA challenge for
   this V1 AJAX flow. It has no CAPTCHA token/widget; enabling a challenge would
   require an additional integration. Keep Formspree's service spam filtering;
   the existing hidden field is validated locally and sent as `_gotcha`.
   Review Spam submissions and dashboard usage/quota. If spam warrants CAPTCHA,
   integrate an on-site supported widget and test it before enabling that setting.
7. Restart `npm run dev` after editing `.env.local`. Open
   `http://127.0.0.1:5173/start-project`. The production bundle needs rebuilding
   after any `VITE_` configuration change.
8. Intentionally submit **one real test enquiry** using contact details you
   control and an unmistakable test business name. This is a manual provider
   call; automated tests do not do this. Confirm **Project received.** appears
   on Webora without a redirect, and an opted-in saved draft clears.
9. Open Formspree's **Submissions** tab and verify that the complete record is
   there, including readable features and contact/project details. Check Spam
   if the record is missing. A success screen alone does not prove inbox delivery.
10. Verify that the notification arrives at `kiratveersinghralhan@gmail.com`
    (including Spam/Junk). Check Reply-To points to the test prospect's `email`.
    If missing, check recipient verification, Email workflow and account limits;
    keep acquisition blocked until both dashboard storage and inbox receipt pass.
11. When you later authorize hosting, add `VITE_FORMSPREE_FORM_ID` to the intended
    Vercel environment(s). Also set `VITE_SITE_URL` to the actual public HTTPS
    origin for canonical URLs, sitemap and indexing. Rebuild/redeploy separately.
    Do not expose management keys in Vercel `VITE_` variables.
12. Intentionally submit **one more real test on the production domain** and
    repeat the on-site, dashboard, inbox and Reply-To checks. If your plan has
    **Restrict to Domain**, allow the actual public domain. Avoid blocking
    localhost before local acceptance; do not add broad preview-domain wildcards.

## Field mapping and receipt

All contact, business, project, budget, timeline and optional requirements fields
retain their current names. `features` becomes a comma-separated readable string,
`existing_website` becomes Yes/No and `consent` becomes an affirmative statement.
`email` is the prospect's email and supports Formspree Reply-To. `subject` is a
static studio enquiry subject. `_gotcha` receives the hidden honeypot value;
filled honeypots fail local validation before any request.

Five UTM fields, source, optional referral tag, referring page and first landing
page are sent as separate fields. Attribution is first entry per tab session,
bounded and kept in session storage (or memory when storage is blocked); URLs
exclude query strings, fragments and credentials. Opted-in drafts retain it for
up to seven days. There are no advertising trackers or contact-data analytics.

A successful AJAX HTTP response confirms Formspree acceptance. It triggers the
existing on-site receipt and draft deletion, and does **not** claim an email was
delivered. Rejections, quota/rate errors, timeouts and network failures keep the
brief and unlock retry. Raw provider errors and personal data are not logged.
There is no automatic retry.

The in-flight lock prevents double clicks in this form. `submission_id` is kept
as an enquiry reference across retries; it is **not** a Formspree idempotency
guarantee. A lost response can follow an accepted submission. Check Submissions
before repeated manual tests, and reconcile any duplicate references there.
Client validation does not stop direct callers from bypassing the website;
Formspree's service/dashboard controls handle hosted intake and spam.

## Optional client autoresponse

The website works with on-site confirmation alone. If your dashboard/plan offers
Auto Response, add **Workflow → + Add New → Auto Response**. Current documentation
lists this for Professional/Business plans; verify availability in your account.
Set From name **Webora**, subject **Your project enquiry — Webora**, and a concise
message such as:

> Hi, thanks for contacting Webora. We've received your project enquiry and will
> review the information you've shared. We'll contact you using the details you
> provided. Webora — Web Design Studio — kiratveersinghralhan@gmail.com —
> +91 98148 00017.

Only add personalized name/business data with the dashboard's supported template
controls and test the rendered email; custom submission-data templates may require
a custom email domain. Do not assume unsupported placeholders will resolve. No
client email is sent by this repository and no autoresponse is promised on-site.

## Automated tests and retained legacy code

`npm test` mocks Formspree fetch calls. Playwright uses a clearly labelled test-only
fixture ID and blocks all `https://formspree.io/**` requests unless a test fulfills
a synthetic response. Never use tests to send real leads or verify email delivery.

`supabase/` is an **inactive legacy prototype** retained with its local database
and Edge tests. It is disconnected from the production frontend and not a V1
launch dependency. Do not apply its migrations, configure secrets or deploy it
for this integration. Active form validation is `shared/enquiry.ts`.

Primary references: [AJAX example](https://formspree.io/guides/squarespace/),
[Reply-To](https://help.formspree.io/articles/building-your-form/email-reply-to-address),
[verified notification recipient](https://help.formspree.io/articles/form-and-project-settings/changing-a-form-email-address),
[honeypot](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering),
[CAPTCHA settings](https://help.formspree.io/articles/form-and-project-settings/recaptcha-settings),
[domain restriction](https://help.formspree.io/articles/form-and-project-settings/restrict-to-domain),
[optional autoresponse](https://help.formspree.io/articles/plugins/sending-a-confirmation-or-response-email/).
