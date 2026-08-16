import { useEffect, useMemo, useReducer, useState } from 'react'
import { appReducer } from './application/appReducer'
import { createEmptyState } from './application/appState'
import { sampleState } from './application/sampleData'
import { toBasket } from './application/toBasket'
import { BasketEditor } from './components/BasketEditor'
import { Recommendation } from './components/Recommendation'
import { ShopEditor } from './components/ShopEditor'
import { optimiseBasket } from './domain/optimiseBasket'
import {
  loadSavedAppState,
  saveAppState,
} from './infrastructure/storage'

type StorageWarning = 'invalid' | 'unavailable' | null

const loadInitialState = () => {
  try {
    const saved = loadSavedAppState(window.localStorage)

    if (saved.status === 'loaded') {
      return { state: saved.state, warning: null as StorageWarning }
    }

    return {
      state: createEmptyState(),
      warning: saved.status === 'invalid' ? ('invalid' as const) : null,
    }
  } catch {
    return {
      state: createEmptyState(),
      warning: 'unavailable' as const,
    }
  }
}

const newId = (prefix: 'shop' | 'item') => `${prefix}-${crypto.randomUUID()}`

export default function App() {
  const [initial] = useState(loadInitialState)
  const [storageWarning, setStorageWarning] = useState<StorageWarning>(
    initial.warning,
  )
  const [state, dispatch] = useReducer(appReducer, initial.state)

  useEffect(() => {
    try {
      saveAppState(window.localStorage, state)
    } catch {
      setStorageWarning('unavailable')
    }
  }, [state])

  const calculation = useMemo(() => {
    const checked = toBasket(state)

    return {
      ...checked,
      result: checked.basket
        ? optimiseBasket(checked.basket)
        : null,
    }
  }, [state])

  return (
    <div className="min-h-screen bg-paper">
      <a
        className="fixed top-3 left-3 z-20 -translate-y-[180%] rounded bg-surface px-[0.85rem] py-[0.6rem] focus:translate-y-0"
        href="#main"
      >
        Skip to basket setup
      </a>

      <header className="sticky top-0 z-[8] flex items-center justify-between gap-3 bg-brand px-page py-[0.55rem] pt-[max(0.55rem,env(safe-area-inset-top))] text-white shadow-[0_1px_4px_rgb(0_0_0_/_0.12)] max-[640px]:flex-wrap [@media(display-mode:standalone)]:pt-[max(1.1rem,env(safe-area-inset-top))]">
        <a
          className="inline-flex items-center gap-[0.45rem] text-[1.15rem] font-extrabold tracking-[-0.03em] text-white no-underline"
          href="/"
          aria-label="BasketSplit home"
        >
          <span
            className="grid size-[1.7rem] place-items-center rounded-[0.35rem] bg-white text-[0.78rem] font-extrabold text-brand"
            aria-hidden="true"
          >
            B
          </span>
          <span>BasketSplit</span>
        </a>
        <div className="flex gap-1">
          <button
            className="inline-flex min-h-9 items-center justify-center rounded-sm bg-white/14 px-[0.9rem] py-[0.45rem] text-[0.88rem] font-bold text-white hover:bg-white/24 motion-safe:transition-colors max-[640px]:min-h-[2.1rem] max-[640px]:px-[0.65rem]"
            type="button"
            onClick={() => dispatch({ type: 'state/replaced', state: sampleState })}
          >
            Load sample
          </button>
          <button
            className="inline-flex min-h-9 items-center justify-center rounded-sm bg-white/14 px-[0.9rem] py-[0.45rem] text-[0.88rem] font-bold text-white hover:bg-white/24 motion-safe:transition-colors max-[640px]:min-h-[2.1rem] max-[640px]:px-[0.65rem]"
            type="button"
            onClick={() =>
              dispatch({ type: 'state/replaced', state: createEmptyState() })
            }
          >
            Reset
          </button>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto w-[min(100%-2rem,72rem)] py-[0.9rem] pb-8 max-[560px]:w-[min(100%-1.1rem,72rem)]"
      >
        <section className="mb-[0.9rem] grid gap-[0.15rem]" aria-labelledby="page-title">
          <p className="text-[0.78rem] font-extrabold text-brand">
            Shopping Cart ({state.items.length})
          </p>
          <h1 className="text-[1.05rem] leading-[1.35] font-semibold tracking-normal text-ink" id="page-title">
            Know when a second shop is worth the stop.
          </h1>
        </section>

        {storageWarning ? (
          <p className="mb-[0.9rem] rounded-sm bg-peach px-4 py-3 text-[0.88rem] text-brand-dark" role="status">
            {storageWarning === 'invalid'
              ? 'Your saved basket could not be restored, so BasketSplit started fresh.'
              : 'This browser cannot save your basket. You can still use BasketSplit for this session.'}
          </p>
        ) : null}

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(17rem,22.5rem)] items-start gap-3 max-[850px]:grid-cols-1">
          <div className="grid gap-3">
            <ShopEditor
              shops={state.shops}
              extraStopCost={state.extraStopCost}
              onAddShop={() =>
                dispatch({
                  type: 'shop/added',
                  shop: { id: newId('shop'), name: '' },
                })
              }
              onRemoveShop={(shopId) => dispatch({ type: 'shop/removed', shopId })}
              onRenameShop={(shopId, name) =>
                dispatch({ type: 'shop/nameChanged', shopId, name })
              }
              onExtraStopCostChange={(value) =>
                dispatch({ type: 'settings/extraStopCostChanged', value })
              }
            />

            <BasketEditor
              items={state.items}
              shops={state.shops}
              onAddItem={() =>
                dispatch({
                  type: 'item/added',
                  item: {
                    id: newId('item'),
                    name: '',
                    quantity: '1',
                    prices: Object.fromEntries(
                      state.shops.map((shop) => [shop.id, '']),
                    ),
                  },
                })
              }
              onRemoveItem={(itemId) => dispatch({ type: 'item/removed', itemId })}
              onRenameItem={(itemId, name) =>
                dispatch({ type: 'item/nameChanged', itemId, name })
              }
              onQuantityChange={(itemId, quantity) =>
                dispatch({ type: 'item/quantityChanged', itemId, quantity })
              }
              onPriceChange={(itemId, shopId, price) =>
                dispatch({ type: 'item/priceChanged', itemId, shopId, price })
              }
            />
          </div>

          <Recommendation
            basket={calculation.basket}
            errors={calculation.errors}
            result={calculation.result}
          />
        </div>
      </main>

      <footer className="flex items-center justify-between gap-3 bg-transparent px-page py-4 text-xs text-muted max-[560px]:flex-col">
        <span>BasketSplit</span>
        <span>Prices stay on this device.</span>
      </footer>
    </div>
  )
}
