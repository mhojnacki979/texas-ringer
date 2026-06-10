# Lessons

- **Date:** 2026-06-09
- **Mistake:** Production validation ran immediately after the deploy gate
  fired; during Railway's cutover window old and new containers both serve
  traffic, so the rate-limit test's failure counts split across instances and
  the lockout appeared broken when it wasn't.
- **Fix:** Re-test after cutover settles, or validate stateful behaviors
  against a single instance (locally) before blaming the code.
- **Avoid:** Treating a stateful-behavior failure observed during a deploy
  transition as a code bug — verify instance affinity first. Also note:
  in-memory rate limiting resets on every deploy and only works single-instance.


- **Date:** 2026-06-09
- **Mistake:** Login/logout redirects built absolute URLs from `request.url`
  (`NextResponse.redirect(new URL('/admin', request.url))`). Behind Railway's
  proxy, `request.url` resolves to the internal localhost address, so after
  signing in the browser was redirected to localhost and failed. Local curl
  tests didn't catch it because localhost was the correct host locally.
- **Fix:** Return 303 responses with a *relative* `Location` header — browsers
  resolve it against the public origin, so no host assumptions are needed.
- **Avoid:** Never build absolute redirect URLs from `request.url` in code that
  runs behind a reverse proxy. And always validate auth flows on the deployed
  environment, not just localhost — proxy behavior differs.
