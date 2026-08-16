/** A non-negative integer stored in the currency's smallest unit. */
export type Amount = number

export interface Shop {
  id: string
  name: string
  order: number
}

export interface Item {
  id: string
  name: string
  quantity: number
}

export type Prices = Readonly<
  Record<string, Readonly<Record<string, Amount | null>>>
>

export interface Basket {
  shops: readonly Shop[]
  items: readonly Item[]
  prices: Prices
  extraStopCost: Amount
}

export interface Purchase {
  itemId: string
  shopId: string
  quantity: number
  unitPrice: Amount
  total: Amount
}

export interface Plan {
  visitedShopIds: readonly string[]
  purchases: readonly Purchase[]
  itemSubtotal: Amount
  extraStopCost: Amount
  total: Amount
}

export type Result =
  | {
      status: 'success'
      bestPlan: Plan
      bestSingleShopPlan: Plan | null
      savingsVersusSingleShop: Amount | null
    }
  | {
      status: 'infeasible'
      reason: 'unavailable-items'
      unavailableItemIds: readonly string[]
    }
  | {
      status: 'infeasible'
      reason: 'requires-more-than-two-shops'
    }
