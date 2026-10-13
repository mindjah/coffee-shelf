import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import type { CoffeeDraft } from './types'
import { blobToBase64 } from './image'
import { getSettings } from './settings'
import { ScanError } from './errors'
import { BagSchema, SYSTEM, USER_PROMPT, toDraft } from './extract'


export async function readBag(images: Blob[]): Promise<CoffeeDraft> {
  const { apiKey, model } = getSettings()
  if (!apiKey) throw new ScanError('noKey')

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const content: Anthropic.Beta.BetaContentBlockParam[] = []
  for (const img of images) {
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: await blobToBase64(img) } })
  }
  content.push({ type: 'text', text: USER_PROMPT })

  let response
  try {
    response = await client.beta.messages.parse({
      model,
      max_tokens: 16000,
      system: SYSTEM,
      messages: [{ role: 'user', content }],
      output_config: {
        format: betaZodOutputFormat(BagSchema),
        // Haiku 4.5 does not accept effort; the rest read a label fine at low effort.
        ...(model.startsWith('claude-haiku') ? {} : { effort: 'low' as const }),
      },
      // Opus 5 can hand off a declined request to another model server-side.
      ...(model === 'claude-opus-5' ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
    })
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new ScanError('badKey')
    if (e instanceof Anthropic.RateLimitError) throw new ScanError('rateLimit')
    if (e instanceof Anthropic.APIConnectionError) throw new ScanError('offline')
    if (e instanceof Anthropic.APIError) throw new ScanError('api', `${e.status ?? ''} ${e.message}`.trim())
    throw e
  }

  if (response.stop_reason === 'refusal') throw new ScanError('refusal')
  if (response.stop_reason === 'max_tokens') throw new ScanError('truncated')
  const bag = response.parsed_output
  if (!bag) throw new ScanError('unreadable')
  return toDraft(bag)
}
