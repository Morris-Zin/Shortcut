import { describe, expect, it } from 'vitest'
import { formatAmount, parseAmount } from './money'

describe('parseAmount', () => {
  it.each([
    ['1', 100],
    ['1.1', 110],
    ['1.10', 110],
    ['0.05', 5],
    ['0', 0],
    ['  1.10  ', 110],
  ])('parses %s as cents', (input, expected) => {
    expect(parseAmount(input)).toBe(expected)
  })

  it.each(['', '   ', '\t\n'])('rejects blank input %j', (input) => {
    expect(parseAmount(input)).toBeNull()
  })

  it('rejects negative amounts', () => {
    expect(parseAmount('-1.00')).toBeNull()
  })

  it.each(['1.001', '0.005'])('rejects over-precise amount %s', (input) => {
    expect(parseAmount(input)).toBeNull()
  })

  it.each(['abc', '1.', '.50', '1,000'])(
    'rejects malformed amount %s',
    (input) => {
      expect(parseAmount(input)).toBeNull()
    },
  )

  it('rejects an amount whose cents are outside the safe integer range', () => {
    expect(parseAmount('90071992547409.92')).toBeNull()
  })
})

describe('formatAmount', () => {
  it.each([
    [0, 'RM 0.00'],
    [5, 'RM 0.05'],
    [110, 'RM 1.10'],
    [123456, 'RM 1,234.56'],
  ])('formats %i cents as %s', (amount, expected) => {
    expect(formatAmount(amount)).toBe(expected)
  })
})
