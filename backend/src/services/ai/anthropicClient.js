import Anthropic from '@anthropic-ai/sdk'
import { env } from '../../config/env.js'

// accept-encoding: identity avoids gzip decompression of the response stream —
// on memory/CPU-constrained hosts, a slow Gunzip stream is prone to
// ERR_STREAM_PREMATURE_CLOSE if the connection is under pressure.
export const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  defaultHeaders: { 'accept-encoding': 'identity' },
})

export const MODELS = {
  free: 'claude-haiku-4-5-20251001',
  full: 'claude-sonnet-5',
}
