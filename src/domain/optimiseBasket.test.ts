import { describe, expect, it } from 'vitest'
import { optimiseBasket } from './optimiseBasket'

describe('optimiseBasket examples', () => {
  const shopA = { id: 'a', name: 'Shop A', order: 0 }
  const shopB = { id: 'b', name: 'Shop B', order: 1 }
  const shopC = { id: 'c', name: 'Shop C', order: 2 }

  it('stays at one shop when that shop is cheapest for every item', () => {
    expect(
      optimiseBasket({
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
      }),
    ).toEqual({
      status: 'success',
      bestPlan: {
        visitedShopIds: ['a'],
        purchases: [
          { itemId: 'bread', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
          { itemId: 'milk', shopId: 'a', quantity: 1, unitPrice: 150, total: 150 },
        ],
        itemSubtotal: 250,
        extraStopCost: 0,
        total: 250,
      },
      bestSingleShopPlan: {
        visitedShopIds: ['a'],
        purchases: [
          { itemId: 'bread', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
          { itemId: 'milk', shopId: 'a', quantity: 1, unitPrice: 150, total: 150 },
        ],
        itemSubtotal: 250,
        extraStopCost: 0,
        total: 250,
      },
      savingsVersusSingleShop: 0,
    })
  })

  it('splits across two shops when the extra stop is worth it', () => {
    expect(
      optimiseBasket({
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
      }),
    ).toEqual({
      status: 'success',
      bestPlan: {
        visitedShopIds: ['a', 'b'],
        purchases: [
          { itemId: 'bread', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
          { itemId: 'milk', shopId: 'b', quantity: 1, unitPrice: 100, total: 100 },
        ],
        itemSubtotal: 200,
        extraStopCost: 50,
        total: 250,
      },
      bestSingleShopPlan: {
        visitedShopIds: ['a'],
        purchases: [
          { itemId: 'bread', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
          { itemId: 'milk', shopId: 'a', quantity: 1, unitPrice: 500, total: 500 },
        ],
        itemSubtotal: 600,
        extraStopCost: 0,
        total: 600,
      },
      savingsVersusSingleShop: 350,
    })
  })

  it('stays at one shop when the extra stop costs more than the saving', () => {
    expect(
      optimiseBasket({
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
      }),
    ).toEqual({
      status: 'success',
      bestPlan: {
        visitedShopIds: ['a'],
        purchases: [
          { itemId: 'bread', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
          { itemId: 'milk', shopId: 'a', quantity: 1, unitPrice: 500, total: 500 },
        ],
        itemSubtotal: 600,
        extraStopCost: 0,
        total: 600,
      },
      bestSingleShopPlan: {
        visitedShopIds: ['a'],
        purchases: [
          { itemId: 'bread', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
          { itemId: 'milk', shopId: 'a', quantity: 1, unitPrice: 500, total: 500 },
        ],
        itemSubtotal: 600,
        extraStopCost: 0,
        total: 600,
      },
      savingsVersusSingleShop: 0,
    })
  })

  it('prefers one shop when a two-shop plan has the same total', () => {
    expect(
      optimiseBasket({
        shops: [shopA, shopB],
        items: [
          { id: 'tea', name: 'Tea', quantity: 1 },
          { id: 'sugar', name: 'Sugar', quantity: 1 },
        ],
        prices: {
          tea: { a: 100, b: 50 },
          sugar: { a: 100, b: 200 },
        },
        extraStopCost: 50,
      }),
    ).toEqual({
      status: 'success',
      bestPlan: {
        visitedShopIds: ['a'],
        purchases: [
          { itemId: 'tea', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
          { itemId: 'sugar', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
        ],
        itemSubtotal: 200,
        extraStopCost: 0,
        total: 200,
      },
      bestSingleShopPlan: {
        visitedShopIds: ['a'],
        purchases: [
          { itemId: 'tea', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
          { itemId: 'sugar', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
        ],
        itemSubtotal: 200,
        extraStopCost: 0,
        total: 200,
      },
      savingsVersusSingleShop: 0,
    })
  })

  it('uses a pair when no single shop sells every item', () => {
    expect(
      optimiseBasket({
        shops: [shopA, shopB],
        items: [
          { id: 'bread', name: 'Bread', quantity: 1 },
          { id: 'eggs', name: 'Eggs', quantity: 1 },
        ],
        prices: {
          bread: { a: 100, b: null },
          eggs: { a: null, b: 200 },
        },
        extraStopCost: 75,
      }),
    ).toEqual({
      status: 'success',
      bestPlan: {
        visitedShopIds: ['a', 'b'],
        purchases: [
          { itemId: 'bread', shopId: 'a', quantity: 1, unitPrice: 100, total: 100 },
          { itemId: 'eggs', shopId: 'b', quantity: 1, unitPrice: 200, total: 200 },
        ],
        itemSubtotal: 300,
        extraStopCost: 75,
        total: 375,
      },
      bestSingleShopPlan: null,
      savingsVersusSingleShop: null,
    })
  })

  it('multiplies unit price by quantity', () => {
    expect(
      optimiseBasket({
        shops: [shopA],
        items: [{ id: 'milk', name: 'Milk', quantity: 3 }],
        prices: { milk: { a: 100 } },
        extraStopCost: 0,
      }),
    ).toEqual({
      status: 'success',
      bestPlan: {
        visitedShopIds: ['a'],
        purchases: [
          { itemId: 'milk', shopId: 'a', quantity: 3, unitPrice: 100, total: 300 },
        ],
        itemSubtotal: 300,
        extraStopCost: 0,
        total: 300,
      },
      bestSingleShopPlan: {
        visitedShopIds: ['a'],
        purchases: [
          { itemId: 'milk', shopId: 'a', quantity: 3, unitPrice: 100, total: 300 },
        ],
        itemSubtotal: 300,
        extraStopCost: 0,
        total: 300,
      },
      savingsVersusSingleShop: 0,
    })
  })

  it('treats zero as an available price', () => {
    expect(
      optimiseBasket({
        shops: [shopA, shopB],
        items: [{ id: 'samples', name: 'Samples', quantity: 2 }],
        prices: { samples: { a: 0, b: 100 } },
        extraStopCost: 0,
      }),
    ).toEqual({
      status: 'success',
      bestPlan: {
        visitedShopIds: ['a'],
        purchases: [
          { itemId: 'samples', shopId: 'a', quantity: 2, unitPrice: 0, total: 0 },
        ],
        itemSubtotal: 0,
        extraStopCost: 0,
        total: 0,
      },
      bestSingleShopPlan: {
        visitedShopIds: ['a'],
        purchases: [
          { itemId: 'samples', shopId: 'a', quantity: 2, unitPrice: 0, total: 0 },
        ],
        itemSubtotal: 0,
        extraStopCost: 0,
        total: 0,
      },
      savingsVersusSingleShop: 0,
    })
  })

  it('breaks equal-price ties by shop order', () => {
    expect(
      optimiseBasket({
        shops: [
          { id: 'later', name: 'Later', order: 10 },
          { id: 'first', name: 'First', order: 1 },
        ],
        items: [{ id: 'rice', name: 'Rice', quantity: 1 }],
        prices: { rice: { later: 100, first: 100 } },
        extraStopCost: 0,
      }),
    ).toEqual({
      status: 'success',
      bestPlan: {
        visitedShopIds: ['first'],
        purchases: [
          { itemId: 'rice', shopId: 'first', quantity: 1, unitPrice: 100, total: 100 },
        ],
        itemSubtotal: 100,
        extraStopCost: 0,
        total: 100,
      },
      bestSingleShopPlan: {
        visitedShopIds: ['first'],
        purchases: [
          { itemId: 'rice', shopId: 'first', quantity: 1, unitPrice: 100, total: 100 },
        ],
        itemSubtotal: 100,
        extraStopCost: 0,
        total: 100,
      },
      savingsVersusSingleShop: 0,
    })
  })

  it('reports items that no shop sells', () => {
    expect(
      optimiseBasket({
        shops: [shopA, shopB],
        items: [
          { id: 'bread', name: 'Bread', quantity: 1 },
          { id: 'eggs', name: 'Eggs', quantity: 1 },
          { id: 'flour', name: 'Flour', quantity: 1 },
        ],
        prices: {
          bread: { a: 100, b: 120 },
          eggs: { a: null, b: null },
          flour: { a: null, b: null },
        },
        extraStopCost: 0,
      }),
    ).toEqual({
      status: 'infeasible',
      reason: 'unavailable-items',
      unavailableItemIds: ['eggs', 'flour'],
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
