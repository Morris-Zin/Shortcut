import type { AppState, BasketItemDraft, ShopDraft } from '../application/appState'

export const APP_STATE_STORAGE_KEY = 'basket-split:v1'

const APP_STATE_STORAGE_VERSION = 1

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type SavedAppStateResult =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'loaded'; state: AppState }

export const saveAppState = (storage: StorageLike, state: AppState): void => {
  storage.setItem(
    APP_STATE_STORAGE_KEY,
    JSON.stringify({ version: APP_STATE_STORAGE_VERSION, state }),
  )
}

export const loadSavedAppState = (storage: StorageLike): SavedAppStateResult => {
  const savedValue = storage.getItem(APP_STATE_STORAGE_KEY)

  if (savedValue === null) {
    return { status: 'empty' }
  }

  try {
    const saved = JSON.parse(savedValue) as unknown

    if (!isVersionedAppState(saved)) {
      return { status: 'invalid' }
    }

    return { status: 'loaded', state: saved.state }
  } catch {
    return { status: 'invalid' }
  }
}

export const clearSavedAppState = (storage: StorageLike): void => {
  storage.removeItem(APP_STATE_STORAGE_KEY)
}

const isVersionedAppState = (
  value: unknown,
): value is { version: typeof APP_STATE_STORAGE_VERSION; state: AppState } =>
  isRecord(value) &&
  value['version'] === APP_STATE_STORAGE_VERSION &&
  isAppState(value['state'])

const isAppState = (value: unknown): value is AppState => {
  if (
    !isRecord(value) ||
    !Array.isArray(value['shops']) ||
    !Array.isArray(value['items'])
  ) {
    return false
  }

  if (
    typeof value['extraStopCost'] !== 'string' ||
    !value['shops'].every(isShopDraft)
  ) {
    return false
  }

  const shopIds = new Set(value['shops'].map((shop) => shop.id))

  return (
    shopIds.size === value['shops'].length &&
    value['items'].every((item) => isBasketItemDraft(item, shopIds)) &&
    hasUniqueIds(value['items'])
  )
}

const isShopDraft = (value: unknown): value is ShopDraft =>
  isRecord(value) &&
  typeof value['id'] === 'string' &&
  typeof value['name'] === 'string'

const isBasketItemDraft = (value: unknown, shopIds: Set<string>): value is BasketItemDraft => {
  if (
    !isRecord(value) ||
    typeof value['id'] !== 'string' ||
    typeof value['name'] !== 'string' ||
    typeof value['quantity'] !== 'string' ||
    !isRecord(value['prices'])
  ) {
    return false
  }

  const prices = Object.entries(value['prices'])

  return (
    prices.length === shopIds.size &&
    prices.every(([shopId, price]) => shopIds.has(shopId) && typeof price === 'string')
  )
}

const hasUniqueIds = (items: BasketItemDraft[]): boolean =>
  new Set(items.map((item) => item.id)).size === items.length

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
