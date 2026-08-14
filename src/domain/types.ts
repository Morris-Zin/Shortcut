export type ShopId = string
export type ItemId = string

/** A non-negative integer stored in the currency's smallest unit. */
export type Amount = number

export interface Shop {
  id: ShopId
  name: string
  order: number
}

export interface Item {
  id: ItemId
  name: string
  quantity: number
}

export type Prices = Readonly<
  Record<ItemId, Readonly<Record<ShopId, Amount | null>>>
>

export interface Basket {
  shops: readonly Shop[]
  items: readonly Item[]
  prices: Prices
  extraStopCost: Amount
}

export interface Purchase {
  itemId: ItemId
  shopId: ShopId
  quantity: number
  unitPrice: Amount
  total: Amount
}

export type ShopIds =
  | readonly [ShopId]
  | readonly [ShopId, ShopId]

export interface Plan {
  visitedShopIds: ShopIds
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
      unavailableItemIds: readonly ItemId[]
    }
  | {
      status: 'infeasible'
      reason: 'requires-more-than-two-shops'
    }
