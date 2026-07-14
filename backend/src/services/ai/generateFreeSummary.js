import { anthropic, MODELS } from './anthropicClient.js'
import { buildFreeSummaryPrompt } from './prompts/systemPrompt.js'

const TOOL = {
  name: 'submit_free_summary',
  description: 'Submit the plain-language accessibility summary for the free report.',
  input_schema: {
    type: 'object',
    properties: {
      plainLanguageSummary: { type: 'string', description: '2-3 sentence plain-language summary.' },
      topIssues: {
        type: 'array',
        maxItems: 5,
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            wcagCriterion: { type: 'string' },
            plainExplanation: { type: 'string' },
            howToFix: { type: 'string' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          },
          required: ['title', 'plainExplanation', 'howToFix', 'severity'],
        },
      },
    },
    required: ['plainLanguageSummary', 'topIssues'],
  },
}

export async function generateFreeSummary(summary, languageCode) {
  const response = await anthropic.messages.create({
    model: MODELS.free,
    max_tokens: 1536,
    system: buildFreeSummaryPrompt(languageCode),
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content: JSON.stringify(summary) }],
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse) throw new Error('AI did not return a structured summary')
  return toolUse.input
}
