// Runs on a 15-minute cron (see wrangler.toml [triggers]). Checks the
// storefront and the API's own health endpoint, and emails ALERT_EMAIL only
// when a target's status actually changes — never on every failed check
// while something stays down, and never on every successful check either.
import { sendEmail } from "./email.js";

const TARGETS = [
  { key: "client", url: "https://hiswillfashion.com", label: "Storefront (hiswillfashion.com)" },
  { key: "api", url: "https://his-will-fashion-api.aalokitharry1995.workers.dev/api/health", label: "API" },
];

async function checkTarget(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendAlert(env, target, isUp) {
  if (!env.ALERT_EMAIL) return;
  const when = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const subject = isUp ? `Back up: ${target.label}` : `Down: ${target.label}`;
  const html = isUp
    ? `<p>${target.label} is responding again as of ${when}.</p>`
    : `<p>${target.label} didn't respond to a health check at ${when}. It'll check again in 15 minutes and email you again once it recovers.</p>`;
  await sendEmail(env, { to: env.ALERT_EMAIL, subject, html });
}

export async function runUptimeCheck(env) {
  for (const target of TARGETS) {
    const isUp = await checkTarget(target.url);
    const row = await env.DB.prepare("SELECT is_up FROM uptime_status WHERE target = ?").bind(target.key).first();
    const now = new Date().toISOString();

    if (!row) {
      await env.DB.prepare("INSERT INTO uptime_status (target, is_up, changed_at) VALUES (?, ?, ?)")
        .bind(target.key, isUp ? 1 : 0, now)
        .run();
      if (!isUp) await sendAlert(env, target, false);
      continue;
    }

    const wasUp = !!row.is_up;
    if (isUp !== wasUp) {
      await env.DB.prepare("UPDATE uptime_status SET is_up = ?, changed_at = ? WHERE target = ?")
        .bind(isUp ? 1 : 0, now, target.key)
        .run();
      await sendAlert(env, target, isUp);
    }
  }
}
