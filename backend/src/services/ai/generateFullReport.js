import { anthropic, MODELS } from './anthropicClient.js'
import { buildFullReportPrompt } from './prompts/systemPrompt.js'
import { withRetry } from '../../utils/retry.js'

const TOOL = {
  name: 'submit_full_report',
  description: 'Submit the full WCAG 2.1 AA report for a paying subscriber.',
  input_schema: {
    type: 'object',
    properties: {
      criteria: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'e.g. 1.1.1' },
            name: { type: 'string' },
            status: { type: 'string', enum: ['pass', 'fail', 'not-tested'] },
            explanation: { type: 'string' },
            howToFix: { type: 'string' },
          },
          required: ['id', 'name', 'status'],
        },
      },
      accessibilityStatementDraft: { type: 'string' },
    },
    required: ['criteria', 'accessibilityStatementDraft'],
  },
}

export async function generateFullReport(summary, languageCode) {
  const response = await withRetry(() =>
    anthropic.messages.create({
      model: MODELS.full,
      max_tokens: 4096,
      system: buildFullReportPrompt(languageCode),
      tools: [TOOL],
      tool_choice: { type: 'tool', name: TOOL.name },
      messages: [{ role: 'user', content: JSON.stringify(summary) }],
    }),
  )

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse) throw new Error('AI did not return a structured full report')
  return toolUse.input
}
