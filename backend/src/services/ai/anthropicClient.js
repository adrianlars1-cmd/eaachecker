import Anthropic from '@anthropic-ai/sdk'
import { env } from '../../config/env.js'

export const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

export const MODELS = {
  free: 'claude-haiku-4-5-20251001',
  full: 'claude-sonnet-5',
}
