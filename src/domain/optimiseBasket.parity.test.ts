import { describe, expect, it } from 'vitest'
import { optimiseBasketBruteForce } from './bruteForceOptimiser'
import { optimiseBasket } from './optimiseBasket'
import type { Amount, Basket, Prices } from './types'

const shops = [
  { id: 'a', name: 'Shop A', order: 0 },
  { id: 'b', name: 'Shop B', order: 1 },
  { id: 'c', name: 'Shop C', order: 2 },
] as const

describe('optimiseBasket parity', () => {
  it('matches brute force for every small two-item price matrix', () => {
    const items = [
      { id: 'x', name: 'Item X', quantity: 1 },
      { id: 'y', name: 'Item Y', quantity: 2 },
    ] as const
    const possiblePrices: readonly (Amount | null)[] = [null, 0, 100, 250]
    const cellCount = shops.length * items.length
    const matrixCount = possiblePrices.length ** cellCount

    for (let matrixNumber = 0; matrixNumber < matrixCount; matrixNumber += 1) {
      const prices = makePrices(matrixNumber, possiblePrices, items)

      for (const extraStopCost of [0, 175]) {
        const basket: Basket = {
          shops,
          items,
          prices,
          extraStopCost,
        }

        expect(
          optimiseBasket(basket),
          `Price matrix ${matrixNumber}, extra stop ${extraStopCost}`,
        ).toEqual(optimiseBasketBruteForce(basket))
      }
    }
  })

  it('matches brute force when the basket requires three shops', () => {
    const basket: Basket = {
      shops,
      items: [
        { id: 'x', name: 'Item X', quantity: 1 },
        { id: 'y', name: 'Item Y', quantity: 1 },
        { id: 'z', name: 'Item Z', quantity: 1 },
      ],
      prices: {
        x: { a: 100, b: null, c: null },
        y: { a: null, b: 100, c: null },
        z: { a: null, b: null, c: 100 },
      },
      extraStopCost: 0,
    }

    expect(optimiseBasket(basket)).toEqual(optimiseBasketBruteForce(basket))
  })
})

function makePrices(
  matrixNumber: number,
  possiblePrices: readonly (Amount | null)[],
  items: readonly { id: string }[],
): Prices {
  let remaining = matrixNumber
  const prices: Record<string, Record<string, Amount | null>> = {}

  for (const item of items) {
    prices[item.id] = {}

    for (const shop of shops) {
      const priceIndex = remaining % possiblePrices.length
      prices[item.id]![shop.id] = possiblePrices[priceIndex] ?? null
      remaining = Math.floor(remaining / possiblePrices.length)
    }
  }

  return prices
}
