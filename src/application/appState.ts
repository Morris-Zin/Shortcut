export interface ShopDraft {
  id: string
  name: string
}

export interface BasketItemDraft {
  id: string
  name: string
  quantity: string
  prices: Record<string, string>
}

export interface AppState {
  shops: ShopDraft[]
  items: BasketItemDraft[]
  extraStopCost: string
}

export const createEmptyState = (): AppState => ({
  shops: [{ id: 'shop-1', name: '' }],
  items: [
    {
      id: 'item-1',
      name: '',
      quantity: '1',
      prices: { 'shop-1': '' },
    },
  ],
  extraStopCost: '',
})
