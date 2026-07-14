import { sendEmail } from './sendgridClient.js'

export async function sendPaymentFailedEmail(to) {
  await sendEmail({
    to,
    subject: 'Action needed: your EAAChecker payment failed',
    html: `<p>We couldn't process your latest EAAChecker subscription payment.</p>
           <p>Please update your payment method to keep your full reports and automatic re-scans active.</p>`,
  })
}

export async function sendRescanAlertEmail(to, { url, previousScore, newScore, newIssueCount }) {
  await sendEmail({
    to,
    subject: `New accessibility issues found on ${url}`,
    html: `<p>Your monthly re-scan of <strong>${url}</strong> is complete.</p>
           <p>Score: ${previousScore ?? '—'} → ${newScore}</p>
           ${newIssueCount > 0 ? `<p>${newIssueCount} new issue(s) were found since your last scan.</p>` : '<p>No new issues were found.</p>'}
           <p>Log in to EAAChecker to see the full report.</p>`,
  })
}
