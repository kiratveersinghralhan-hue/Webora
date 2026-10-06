# Inactive legacy enquiry prototype

WEBORA V1 uses Formspree. Nothing in this directory is used by the production
frontend or required to receive enquiries. Do not deploy these functions or
apply these migrations for the current Formspree integration.

The original storage, RLS, rate limiting, transactional intake and Resend queue
prototype is retained for possible future evaluation. Its `_shared/enquiry.ts`
is an archived validation snapshot. Active frontend validation now lives in
`shared/enquiry.ts`, independent of this directory. Database and Edge tests are
retained local regression evidence for this inactive prototype only.

No Supabase project, credentials, email worker or Resend sender is required for
V1. See `../BACKEND-SETUP.md` for the active Formspree setup.
