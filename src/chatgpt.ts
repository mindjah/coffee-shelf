import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import type { CoffeeDraft } from './types'
import { blobToBase64 } from './image'
import { getSettings } from './settings'
import { ScanError } from './errors'
import { BagSchema, SYSTEM, USER_PROMPT, toDraft } from './extract'

function toScanError(e: unknown): unknown {
  if (e instanceof OpenAI.APIUserAbortError) return e // cancelled by the user; the screen handles it
  if (e instanceof OpenAI.AuthenticationError || e instanceof OpenAI.PermissionDeniedError) return new ScanError('badKey')
  if (e instanceof OpenAI.NotFoundError) return new ScanError('noModel')
  // A new OpenAI account answers 429 "insufficient_quota" until credit is added.
  if (e instanceof OpenAI.RateLimitError) return new ScanError(e.code === 'insufficient_quota' ? 'noCredit' : 'rateLimit')
  if (e instanceof OpenAI.APIConnectionError) return new ScanError('offline')
  if (e instanceof OpenAI.APIError) return new ScanError('api', `${e.status ?? ''} ${e.message}`.trim())
  return e
}

const client = (apiKey: string) => new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

/** Checks the key and model with a model lookup, which costs nothing. */
export async function testKey(apiKey: string, model: string): Promise<void> {
  try {
    await client(apiKey).models.retrieve(model)
  } catch (e) {
    throw toScanError(e)
  }
}

export async function readBag(images: Blob[], signal?: AbortSignal): Promise<CoffeeDraft> {
  const { openaiKey, openaiModel } = getSettings()
  if (!openaiKey) throw new ScanError('noKey')

  const content = [
    ...(await Promise.all(images.map(async (img) => ({
      type: 'input_image' as const,
      image_url: `data:image/jpeg;base64,${await blobToBase64(img)}`,
      detail: 'high' as const,
    })))),
    { type: 'input_text' as const, text: USER_PROMPT },
  ]

  let response
  try {
    response = await client(openaiKey).responses.parse(
      {
        model: openaiModel,
        instructions: SYSTEM,
        input: [{ role: 'user', content }],
        text: { format: zodTextFormat(BagSchema, 'coffee_bag') },
        max_output_tokens: 16000,
      },
      { signal },
    )
  } catch (e) {
    // OpenAI's error replies from this endpoint lack the CORS header, so a wrong key looks like
    // "no connection" in the browser. The model lookup does send it: ask that for the real reason.
    if (e instanceof OpenAI.APIConnectionError && !(e instanceof OpenAI.APIUserAbortError) && !signal?.aborted) {
      try {
        await client(openaiKey).models.retrieve(openaiModel)
      } catch (diagnosis) {
        throw toScanError(diagnosis)
      }
    }
    throw toScanError(e)
  }

  const refused = response.output.some((item) => item.type === 'message' && item.content.some((c) => c.type === 'refusal'))
  if (refused) throw new ScanError('refusal')
  if (response.incomplete_details?.reason === 'max_output_tokens') throw new ScanError('truncated')
  const bag = response.output_parsed
  if (!bag) throw new ScanError('unreadable')
  return toDraft(bag)
}
