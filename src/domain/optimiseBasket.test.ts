import { describe, expect, it } from 'vitest'
import { optimiseBasketBruteForce } from './bruteForceOptimiser'
import { optimiseBasket } from './optimiseBasket'
import type { Amount, Basket, Prices } from './types'

const shops = [
  { id: 'a', name: 'Shop A', order: 0 },
  { id: 'b', name: 'Shop B', order: 1 },
  { id: 'c', name: 'Shop C', order: 2 },
] as const

describe('optimiseBasket', () => {
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

describe('optimiseBasket examples', () => {
  const shopA = { id: 'a', name: 'Shop A', order: 0 }
  const shopB = { id: 'b', name: 'Shop B', order: 1 }
  const shopC = { id: 'c', name: 'Shop C', order: 2 }

  it('stays at one shop when that shop is cheapest for every item', () => {
    const result = optimiseBasket({
      shops: [shopA, shopB],
      items: [
        { id: 'bread', name: 'Bread', quantity: 1 },
        { id: 'milk', name: 'Milk', quantity: 1 },
      ],
      prices: {
        bread: { a: 100, b: 200 },
        milk: { a: 150, b: 250 },
      },
      extraStopCost: 50,
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') {
      return
    }

    expect(result.bestPlan.visitedShopIds).toEqual(['a'])
    expect(result.bestPlan.purchases).toEqual([
      { itemId: 'bread', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
      { itemId: 'milk', shopId: 'a', quantity: 1, unitPrice: 150, total: 150 },
    ])
    expect(result.bestPlan.extraStopCost).toBe(0)
    expect(result.bestPlan.total).toBe(250)
    expect(result.bestSingleShopPlan?.visitedShopIds).toEqual(['a'])
    expect(result.savingsVersusSingleShop).toBe(0)
  })

  it('splits across two shops when the extra stop is worth it', () => {
    const result = optimiseBasket({
      shops: [shopA, shopB],
      items: [
        { id: 'bread', name: 'Bread', quantity: 1 },
        { id: 'milk', name: 'Milk', quantity: 1 },
      ],
      prices: {
        bread: { a: 100, b: 500 },
        milk: { a: 500, b: 100 },
      },
      extraStopCost: 50,
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') {
      return
    }

    expect(result.bestPlan.visitedShopIds).toEqual(['a', 'b'])
    expect(result.bestPlan.purchases).toEqual([
      { itemId: 'bread', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
      { itemId: 'milk', shopId: 'b', quantity: 1, unitPrice: 100, total: 100 },
    ])
    expect(result.bestPlan.itemSubtotal).toBe(200)
    expect(result.bestPlan.extraStopCost).toBe(50)
    expect(result.bestPlan.total).toBe(250)
    expect(result.bestSingleShopPlan?.total).toBe(600)
    expect(result.savingsVersusSingleShop).toBe(350)
  })

  it('stays at one shop when the extra stop costs more than the saving', () => {
    const result = optimiseBasket({
      shops: [shopA, shopB],
      items: [
        { id: 'bread', name: 'Bread', quantity: 1 },
        { id: 'milk', name: 'Milk', quantity: 1 },
      ],
      prices: {
        bread: { a: 100, b: 500 },
        milk: { a: 500, b: 100 },
      },
      extraStopCost: 1000,
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') {
      return
    }

    expect(result.bestPlan.visitedShopIds).toEqual(['a'])
    expect(result.bestPlan.total).toBe(600)
    expect(result.bestPlan.extraStopCost).toBe(0)
    expect(result.savingsVersusSingleShop).toBe(0)
  })

  it('multiplies unit price by quantity', () => {
    const result = optimiseBasket({
      shops: [shopA],
      items: [{ id: 'milk', name: 'Milk', quantity: 3 }],
      prices: { milk: { a: 100 } },
      extraStopCost: 0,
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') {
      return
    }

    expect(result.bestPlan.purchases[0]?.total).toBe(300)
    expect(result.bestPlan.total).toBe(300)
  })

  it('reports items that no shop sells', () => {
    expect(
      optimiseBasket({
        shops: [shopA, shopB],
        items: [
          { id: 'bread', name: 'Bread', quantity: 1 },
          { id: 'eggs', name: 'Eggs', quantity: 1 },
        ],
        prices: {
          bread: { a: 100, b: 120 },
          eggs: { a: null, b: null },
        },
        extraStopCost: 0,
      }),
    ).toEqual({
      status: 'infeasible',
      reason: 'unavailable-items',
      unavailableItemIds: ['eggs'],
    })
  })

  it('cannot finish a basket that needs three shops', () => {
    expect(
      optimiseBasket({
        shops: [shopA, shopB, shopC],
        items: [
          { id: 'bread', name: 'Bread', quantity: 1 },
          { id: 'milk', name: 'Milk', quantity: 1 },
          { id: 'eggs', name: 'Eggs', quantity: 1 },
        ],
        prices: {
          bread: { a: 100, b: null, c: null },
          milk: { a: null, b: 100, c: null },
          eggs: { a: null, b: null, c: 100 },
        },
        extraStopCost: 0,
      }),
    ).toEqual({
      status: 'infeasible',
      reason: 'requires-more-than-two-shops',
    })
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
