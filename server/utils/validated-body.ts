import type { ZodType } from 'zod'

export async function parseRequestBody<T>(event: Parameters<typeof readBody>[0], schema: ZodType<T>): Promise<T> {
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Некорректные данные', data: parsed.error.flatten() })
  return parsed.data
}
