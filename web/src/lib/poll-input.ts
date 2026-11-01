import { MAX_DESCRIPTION_BYTES, MAX_NAME_BYTES } from '@/lib/config'

const MAX_U64 = BigInt('18446744073709551615')

export const byteLength = (value: string) => new TextEncoder().encode(value).length

export const parsePollId = (value: string): bigint | null => {
  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const pollId = BigInt(trimmed)
  if (pollId > MAX_U64) return null
  return pollId
}

export const parseUnixSeconds = (value: string): bigint | null => {
  if (!value) return null
  const milliseconds = new Date(value).getTime()
  if (Number.isNaN(milliseconds)) return null
  return BigInt(Math.floor(milliseconds / 1000))
}

export const formatUnixSeconds = (seconds: bigint) => {
  const milliseconds = Number(seconds) * 1000
  if (!Number.isSafeInteger(milliseconds)) return 'Unknown time'
  return new Date(milliseconds).toLocaleString()
}

export const getPollWindow = (
  start: bigint,
  end: bigint,
  nowSeconds: bigint,
): 'before' | 'open' | 'after' => {
  if (nowSeconds <= start) return 'before'
  if (nowSeconds > end) return 'after'
  return 'open'
}

export const validateName = (value: string, label: string): string | null => {
  const trimmed = value.trim()
  if (!trimmed) return `Enter a ${label}.`
  if (byteLength(trimmed) > MAX_NAME_BYTES) {
    return `${label[0]?.toUpperCase()}${label.slice(1)} must be ${MAX_NAME_BYTES} bytes or fewer.`
  }
  return null
}

export const validateDescription = (value: string): string | null => {
  const trimmed = value.trim()
  if (!trimmed) return 'Enter a description.'
  if (byteLength(trimmed) > MAX_DESCRIPTION_BYTES) {
    return `Description must be ${MAX_DESCRIPTION_BYTES} bytes or fewer.`
  }
  return null
}
