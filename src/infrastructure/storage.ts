import type { AppState } from '../application/appState'

export const APP_STATE_STORAGE_KEY = 'basket-split:v1'

const APP_STATE_STORAGE_VERSION = 1

export type SavedAppStateResult =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'loaded'; state: AppState }

export const saveAppState = (storage: Storage, state: AppState): void => {
  storage.setItem(
    APP_STATE_STORAGE_KEY,
    JSON.stringify({ version: APP_STATE_STORAGE_VERSION, state }),
  )
}

export const loadSavedAppState = (storage: Storage): SavedAppStateResult => {
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

  return (
    typeof value['extraStopCost'] === 'string' &&
    value['shops'].every(
      (shop) =>
        isRecord(shop) &&
        typeof shop['id'] === 'string' &&
        typeof shop['name'] === 'string',
    ) &&
    value['items'].every(
      (item) =>
        isRecord(item) &&
        typeof item['id'] === 'string' &&
        typeof item['name'] === 'string' &&
        typeof item['quantity'] === 'string' &&
        isRecord(item['prices']),
    )
  )
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
