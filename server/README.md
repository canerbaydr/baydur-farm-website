# Baydur Farm quote mail

The static form sends JSON to the `baydurfarm-mail` Cloudflare Worker.
The Worker validates and rate-limits the request and signs it with RSA/SHA-256.
The Google Apps Script in `google-mail.gs` verifies the signature and sends only
to `baydurfarm@gmail.com`. Request IDs prevent acknowledged retries from being
sent twice. Visitor email addresses are used only as Reply-To.

The Google project is `1a_Tbe0Dl7bfkiRC-U8fbR5lVrUzLPJEk1Zt3P6iETPV7zuBmvqat4upj`.
Its owner is the Baydur Farm account. `appsscript.json` limits authorization to
`script.send_mail`; no inbox-reading permission is requested.

Required Worker secrets: `MAIL_SIGNING_KEY` (private RSA JWK, never committed)
and `GOOGLE_SCRIPT_URL` (the deployed Google web app `/exec` URL).
The matching public key is embedded in `google-mail.gs`. To rotate the key,
update both services together. Keep existing secret bindings on Worker updates.

Deployment is complete only after the owner authorizes Google MailApp, the
Google script is deployed to execute as the owner with anonymous access, its
returned URL is stored in the Worker, and a live quote submission is confirmed.

Checks: `node --test tests/quote-form.test.mjs tests/mail-backend.test.mjs`.
Local tests simulate the Google service; they do not prove inbox delivery.
