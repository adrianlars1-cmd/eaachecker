import dns from 'node:dns'
import privateIp from 'private-ip'

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

class ScanValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ScanValidationError'
  }
}

function isBlockedHostname(hostname) {
  const lower = hostname.toLowerCase()
  return lower === 'localhost' || lower.endsWith('.localhost')
}

async function resolveAllIps(hostname) {
  try {
    const records = await dns.promises.lookup(hostname, { all: true, verbatim: true })
    return records.map((r) => r.address)
  } catch {
    throw new ScanValidationError('Could not resolve that domain name.')
  }
}

async function assertPublicHost(hostname) {
  if (isBlockedHostname(hostname)) {
    throw new ScanValidationError('Scanning local/internal addresses is not allowed.')
  }

  const ips = await resolveAllIps(hostname)
  if (ips.length === 0) {
    throw new ScanValidationError('Could not resolve that domain name.')
  }
  for (const ip of ips) {
    if (privateIp(ip)) {
      throw new ScanValidationError('That address resolves to a private or internal network and cannot be scanned.')
    }
  }
}

/**
 * Validates a user-submitted URL before it is ever handed to a headless browser.
 * Throws ScanValidationError with a user-safe message on any violation.
 */
export async function validateUrl(rawUrl) {
  let parsed
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new ScanValidationError('Please enter a valid website address.')
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new ScanValidationError('Only http and https addresses can be scanned.')
  }

  await assertPublicHost(parsed.hostname)

  return parsed.toString()
}

/**
 * Re-validates a URL reached after redirects (e.g. page.url() post-navigation),
 * to catch DNS-rebinding / redirect-to-internal-host attempts.
 */
export async function assertUrlStillSafe(finalUrl) {
  const parsed = new URL(finalUrl)
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new ScanValidationError('The page redirected to a disallowed address.')
  }
  await assertPublicHost(parsed.hostname)
}

export { ScanValidationError }
