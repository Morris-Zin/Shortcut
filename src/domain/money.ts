import type { Amount } from './types'

export function parseAmount(value: string): Amount | null {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim())

  if (!match) {
    return null
  }

  const whole = Number(match[1])
  const fraction = Number((match[2] ?? '').padEnd(2, '0'))
  const amount = whole * 100 + fraction

  return Number.isSafeInteger(amount) ? amount : null
}

export function formatAmount(amount: Amount): string {
  const whole = Math.floor(amount / 100)
  const fraction = String(amount % 100).padStart(2, '0')

  return `RM ${whole.toLocaleString('en-MY')}.${fraction}`
}
