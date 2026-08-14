import type { AppState, BasketItemDraft, ShopDraft } from './appState'

export type AppAction =
  | { type: 'shop/added'; shop: ShopDraft }
  | { type: 'shop/nameChanged'; shopId: string; name: string }
  | { type: 'shop/removed'; shopId: string }
  | { type: 'item/added'; item: BasketItemDraft }
  | { type: 'item/nameChanged'; itemId: string; name: string }
  | { type: 'item/quantityChanged'; itemId: string; quantity: string }
  | {
      type: 'item/priceChanged'
      itemId: string
      shopId: string
      price: string
    }
  | { type: 'item/removed'; itemId: string }
  | { type: 'settings/extraStopCostChanged'; value: string }
  | { type: 'state/replaced'; state: AppState }

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'shop/added':
      return {
        ...state,
        shops: [...state.shops, action.shop],
        items: state.items.map((item) => ({
          ...item,
          prices: { ...item.prices, [action.shop.id]: '' },
        })),
      }

    case 'shop/nameChanged':
      return {
        ...state,
        shops: state.shops.map((shop) =>
          shop.id === action.shopId ? { ...shop, name: action.name } : shop,
        ),
      }

    case 'shop/removed':
      return {
        ...state,
        shops: state.shops.filter((shop) => shop.id !== action.shopId),
        items: state.items.map((item) => {
          const prices = { ...item.prices }
          delete prices[action.shopId]
          return { ...item, prices }
        }),
      }

    case 'item/added':
      return { ...state, items: [...state.items, action.item] }

    case 'item/nameChanged':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.itemId ? { ...item, name: action.name } : item,
        ),
      }

    case 'item/quantityChanged':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.itemId
            ? { ...item, quantity: action.quantity }
            : item,
        ),
      }

    case 'item/priceChanged':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.itemId
            ? {
                ...item,
                prices: { ...item.prices, [action.shopId]: action.price },
              }
            : item,
        ),
      }

    case 'item/removed':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.itemId),
      }

    case 'settings/extraStopCostChanged':
      return { ...state, extraStopCost: action.value }

    case 'state/replaced':
      return action.state
  }
}
