import { describe, expect, it } from 'vitest'
import { toBasket } from './toBasket'
import type { AppState } from './appState'

describe('toBasket', () => {
  it('converts trimmed draft values into a basket', () => {
    expect(convertDraft()).toEqual({
      basket: {
        shops: [{ id: 'shop-1', name: 'Market', order: 0 }],
        items: [{ id: 'item-1', name: 'Rice', quantity: 2 }],
        prices: { 'item-1': { 'shop-1': 110 } },
        extraStopCost: 5,
      },
      errors: [],
    })
  })

  it('represents a blank price as unavailable without an error', () => {
    const result = convertDraft({ price: '  ' })

    expect(result).toEqual({
      basket: {
        shops: [{ id: 'shop-1', name: 'Market', order: 0 }],
        items: [{ id: 'item-1', name: 'Rice', quantity: 2 }],
        prices: { 'item-1': { 'shop-1': null } },
        extraStopCost: 5,
      },
      errors: [],
    })
  })

  it('keeps an explicit zero price as a valid price', () => {
    const result = convertDraft({ price: '0', extraStopCost: '0' })

    expect(result).toEqual({
      basket: {
        shops: [{ id: 'shop-1', name: 'Market', order: 0 }],
        items: [{ id: 'item-1', name: 'Rice', quantity: 2 }],
        prices: { 'item-1': { 'shop-1': 0 } },
        extraStopCost: 0,
      },
      errors: [],
    })
  })

  it('reports blank shop and item names', () => {
    const result = convertDraft({ shopName: ' \t ', itemName: '\n' })

    expect(result).toEqual({
      basket: null,
      errors: ['Name shop 1.', 'Name item 1.'],
    })
  })

  it.each(['', '   ', 'not-a-number', '0', '-1', '1.5'])(
    'rejects invalid quantity %j',
    (quantity) => {
      const result = convertDraft({ quantity })

      expect(result).toEqual({
        basket: null,
        errors: ['Use a positive whole-number quantity for item 1.'],
      })
    },
  )

  it('rejects an invalid item price', () => {
    expect(convertDraft({ price: '1.234' })).toEqual({
      basket: null,
      errors: ['Check the price for item 1 at shop 1.'],
    })
  })

  it.each(['', '   ', 'not-a-number'])(
    'rejects blank or invalid extra stop cost %j',
    (extraStopCost) => {
      expect(convertDraft({ extraStopCost })).toEqual({
        basket: null,
        errors: ['Enter the cost of one extra stop, using 0.00 if it is free.'],
      })
    },
  )
})

function convertDraft(overrides: Partial<DraftValues> = {}) {
  const values: DraftValues = {
    shopName: '  Market  ',
    itemName: '  Rice  ',
    quantity: '2',
    price: '1.10',
    extraStopCost: '0.05',
    ...overrides,
  }

  const state: AppState = {
    shops: [{ id: 'shop-1', name: values.shopName }],
    items: [
      {
        id: 'item-1',
        name: values.itemName,
        quantity: values.quantity,
        prices: { 'shop-1': values.price },
      },
    ],
    extraStopCost: values.extraStopCost,
  }

  return toBasket(state)
}

interface DraftValues {
  shopName: string
  itemName: string
  quantity: string
  price: string
  extraStopCost: string
}
