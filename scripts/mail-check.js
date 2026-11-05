/**
 * Mail connection check. Run on the server inside the app's virtual environment:
 *
 *   SMTP_PASS='your-mailbox-password' node scripts/mail-check.js you@gmail.com
 *
 * It tries the usual mail server settings for this hosting one by one, tells you which work, and (if you pass an address)
 * sends a real test email through the first one that works. Nothing is saved anywhere.
 */
const USER = process.env.SMTP_USER || "info@alanfaldoc.com";
const PASS = process.env.SMTP_PASS;
const TO = process.argv[2];
const HOSTS = (process.env.SMTP_HOSTS || "alanfaldoc.com,mail.alanfaldoc.com,server358.web-hosting.com").split(",");

let nodemailer;
try { nodemailer = require("nodemailer"); } catch { console.error("\nFAIL: the 'nodemailer' package is not installed on this server.\nFix: run  npm install --include=dev  in the app folder, then try again.\n"); process.exit(1); }
if (!PASS) { console.error("\nSet the password first, for example:\n  SMTP_PASS='your-password' node scripts/mail-check.js you@gmail.com\n"); process.exit(1); }

(async () => {
  let working = null;
  for (const host of HOSTS) for (const [port, secure] of [[465, true], [587, false]]) {
    const label = `${host}:${port} (${secure ? "SSL/TLS" : "STARTTLS"})`;
    const t = nodemailer.createTransport({ host, port, secure, auth: { user: USER, pass: PASS }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 });
    try { await t.verify(); console.log("OK    ", label, "- connected and logged in"); working ??= { host, port, secure, t }; }
    catch (e) { console.log("FAIL  ", label, "-", e.code || "", (e.message || "").split("\n")[0]); }
  }
  if (!working) {
    console.log("\nNo setting worked. Read the messages above:\n - EAUTH / 535: wrong username or password (reset the mailbox password in cPanel > Email Accounts)\n - ETIMEDOUT / ECONNREFUSED: the port is blocked, ask Namecheap support to allow outgoing SMTP for your account\n - certificate / altnames: use the server name host (server358.web-hosting.com) as SMTP_HOST");
    process.exit(2);
  }
  console.log(`\nUse these in Setup Node.js App:  SMTP_HOST=${working.host}  SMTP_PORT=${working.port}`);
  if (TO) {
    try {
      const r = await working.t.sendMail({ from: `Al Anfal Doc <${USER}>`, to: TO, subject: "Mail check from alanfaldoc.com server", text: "If you can read this, the server can send email with your mailbox." });
      console.log("SENT  ", TO, "->", r.response);
      console.log("Check the inbox AND the spam folder.");
    } catch (e) { console.log("SEND FAILED:", e.code || "", e.message); process.exit(3); }
  }
})();
