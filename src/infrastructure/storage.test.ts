import { describe, expect, it } from 'vitest'
import { createEmptyState } from '../application/appState'
import { sampleState } from '../application/sampleData'
import {
  APP_STATE_STORAGE_KEY,
  clearSavedAppState,
  loadSavedAppState,
  saveAppState,
  type StorageLike,
} from './storage.ts'

class FakeStorage implements StorageLike {
  private readonly values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }
}

describe('app state storage', () => {
  it('saves only the versioned AppState payload under its key', () => {
    const storage = new FakeStorage()

    saveAppState(storage, sampleState)

    expect(storage.getItem(APP_STATE_STORAGE_KEY)).toBe(
      JSON.stringify({ version: 1, state: sampleState }),
    )
  })

  it('loads a valid versioned AppState', () => {
    const storage = new FakeStorage()
    saveAppState(storage, sampleState)

    expect(loadSavedAppState(storage)).toEqual({ status: 'loaded', state: sampleState })
  })

  it('loads editable blank names from an empty draft', () => {
    const storage = new FakeStorage()
    const blankState = createEmptyState()
    saveAppState(storage, blankState)

    expect(loadSavedAppState(storage)).toEqual({ status: 'loaded', state: blankState })
  })

  it('distinguishes an empty store from corrupt saved data', () => {
    const storage = new FakeStorage()

    expect(loadSavedAppState(storage)).toEqual({ status: 'empty' })

    storage.setItem(APP_STATE_STORAGE_KEY, '{not json')

    expect(loadSavedAppState(storage)).toEqual({ status: 'invalid' })
  })

  it.each([
    ['a missing version', { state: sampleState }],
    ['a different version', { version: 2, state: sampleState }],
    ['a non-array shops value', { version: 1, state: { ...sampleState, shops: {} } }],
    [
      'a duplicate shop id',
      {
        version: 1,
        state: {
          ...sampleState,
          shops: [sampleState.shops[0], sampleState.shops[0]],
        },
      },
    ],
    [
      'a duplicate item id',
      {
        version: 1,
        state: {
          ...sampleState,
          items: [sampleState.items[0], sampleState.items[0]],
        },
      },
    ],
    [
      'a non-string quantity',
      {
        version: 1,
        state: {
          ...sampleState,
          items: [{ ...sampleState.items[0], quantity: 2 }],
        },
      },
    ],
    [
      'a non-string price',
      {
        version: 1,
        state: {
          ...sampleState,
          items: [
            {
              ...sampleState.items[0],
              prices: { [sampleState.shops[0]!.id]: 5 },
            },
          ],
        },
      },
    ],
    [
      'a price map that is missing a shop',
      {
        version: 1,
        state: {
          ...sampleState,
          items: [
            {
              ...sampleState.items[0],
              prices: { [sampleState.shops[0]!.id]: '5.50' },
            },
          ],
        },
      },
    ],
  ])('reports %s as invalid', (_label, savedPayload) => {
    const storage = new FakeStorage()
    storage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(savedPayload))

    expect(loadSavedAppState(storage)).toEqual({ status: 'invalid' })
  })

  it('removes a saved AppState', () => {
    const storage = new FakeStorage()
    saveAppState(storage, sampleState)

    clearSavedAppState(storage)

    expect(loadSavedAppState(storage)).toEqual({ status: 'empty' })
  })
})
