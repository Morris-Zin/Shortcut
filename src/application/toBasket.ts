import { parseAmount } from '../domain/money'
import type { Amount, Basket, Item, Prices, Shop } from '../domain/types'
import type { AppState } from './appState'

export function toBasket(state: AppState): {
  basket: Basket | null
  errors: string[]
} {
  const errors: string[] = []

  const shops: Shop[] = state.shops.map((shop, index) => {
    const name = shop.name.trim()

    if (!name) {
      errors.push(`Name shop ${index + 1}.`)
    }

    return { id: shop.id, name, order: index }
  })

  const items: Item[] = state.items.map((item, index) => {
    const name = item.name.trim()
    const quantity = Number(item.quantity)

    if (!name) {
      errors.push(`Name item ${index + 1}.`)
    }

    if (
      !/^\d+$/.test(item.quantity.trim()) ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    ) {
      errors.push(`Use a positive whole-number quantity for item ${index + 1}.`)
    }

    return {
      id: item.id,
      name,
      quantity,
    }
  })

  const prices: Record<string, Record<string, Amount | null>> = {}

  state.items.forEach((item, itemIndex) => {
    const itemPrices: Record<string, Amount | null> = {}

    state.shops.forEach((shop, shopIndex) => {
      const value = item.prices[shop.id]?.trim() ?? ''

      if (!value) {
        itemPrices[shop.id] = null
        return
      }

      const amount = parseAmount(value)

      if (amount === null) {
        errors.push(
          `Check the price for item ${itemIndex + 1} at shop ${shopIndex + 1}.`,
        )
        itemPrices[shop.id] = null
        return
      }

      itemPrices[shop.id] = amount
    })

    prices[item.id] = itemPrices
  })

  const extraStopCost = parseAmount(state.extraStopCost)

  if (extraStopCost === null) {
    errors.push('Enter the cost of one extra stop, using 0.00 if it is free.')
  }

  if (errors.length > 0 || extraStopCost === null) {
    return { basket: null, errors }
  }

  return {
    basket: {
      shops,
      items,
      prices: prices as Prices,
      extraStopCost,
    },
    errors: [],
  }
}
