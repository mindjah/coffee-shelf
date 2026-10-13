import { ApiError, FinishReason, GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import type { CoffeeDraft } from './types'
import { blobToBase64 } from './image'
import { getSettings } from './settings'
import { ScanError } from './errors'
import { BagSchema, SYSTEM, USER_PROMPT, toDraft } from './extract'

// Gemini takes plain JSON Schema; drop the $schema marker it doesn't accept.
const { $schema: _, ...responseJsonSchema } = z.toJSONSchema(BagSchema) as Record<string, unknown>

export async function readBag(images: Blob[]): Promise<CoffeeDraft> {
  const { geminiKey, geminiModel } = getSettings()
  if (!geminiKey) throw new ScanError('noKey')

  const ai = new GoogleGenAI({ apiKey: geminiKey })
  const parts = [
    ...(await Promise.all(images.map(async (img) => ({ inlineData: { mimeType: 'image/jpeg', data: await blobToBase64(img) } })))),
    { text: USER_PROMPT },
  ]

  let response
  try {
    response = await ai.models.generateContent({
      model: geminiModel,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: 'application/json',
        responseJsonSchema,
        maxOutputTokens: 16000,
      },
    })
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 429) throw new ScanError('rateLimit')
      if (e.status === 401 || e.status === 403 || /api key/i.test(e.message)) throw new ScanError('badKey')
      throw new ScanError('api', `${e.status} ${e.message}`.slice(0, 200))
    }
    if (e instanceof TypeError) throw new ScanError('offline')
    throw e
  }

  if (response.promptFeedback?.blockReason) throw new ScanError('refusal')
  const finish = response.candidates?.[0]?.finishReason
  if (finish === FinishReason.MAX_TOKENS) throw new ScanError('truncated')
  if (finish === FinishReason.SAFETY || finish === FinishReason.PROHIBITED_CONTENT) throw new ScanError('refusal')

  let parsed
  try {
    parsed = BagSchema.safeParse(JSON.parse(response.text ?? ''))
  } catch {
    throw new ScanError('unreadable')
  }
  if (!parsed.success) throw new ScanError('unreadable')
  return toDraft(parsed.data)
}
