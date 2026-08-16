import { useEffect, useMemo, useReducer, useState } from 'react'
import './App.css'
import { appReducer } from './application/appReducer'
import { createEmptyState } from './application/appState'
import { sampleState } from './application/sampleData'
import { toBasket } from './application/toBasket'
import { BasketEditor } from './components/BasketEditor'
import { Recommendation } from './components/Recommendation'
import { ShopEditor } from './components/ShopEditor'
import { formatAmount } from './domain/money'
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
  const [cartQuery, setCartQuery] = useState('')

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
    <div className="app-shell">
      <a className="skip" href="#main">
        Skip to basket setup
      </a>

      <header className="site-header">
        <a className="wordmark" href="/" aria-label="BasketSplit home">
          <span className="wordmark-mark" aria-hidden="true">
            B
          </span>
          <span>BasketSplit</span>
        </a>
        <label className="header-search">
          <span className="visually-hidden">Search in cart</span>
          <input
            type="search"
            value={cartQuery}
            placeholder="Search in cart"
            onChange={(event) => setCartQuery(event.target.value)}
          />
        </label>
        <div className="header-actions">
          <button
            className="button button-quiet"
            type="button"
            onClick={() => dispatch({ type: 'state/replaced', state: sampleState })}
          >
            Load sample
          </button>
          <button
            className="button button-quiet"
            type="button"
            onClick={() =>
              dispatch({ type: 'state/replaced', state: createEmptyState() })
            }
          >
            Reset
          </button>
        </div>
      </header>

      <main id="main" className="page-shell">
        <section className="intro" aria-labelledby="page-title">
          <p className="intro-kicker">Shopping Cart ({state.items.length})</p>
          <h1 id="page-title">Know when a second shop is worth the stop.</h1>
        </section>

        {storageWarning ? (
          <p className="storage-warning" role="status">
            {storageWarning === 'invalid'
              ? 'Your saved basket could not be restored, so BasketSplit started fresh.'
              : 'This browser cannot save your basket. You can still use BasketSplit for this session.'}
          </p>
        ) : null}

        <div className="workspace">
          <div className="editor-column">
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
              query={cartQuery}
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

      <footer className="site-footer">
        <span>BasketSplit</span>
        <span>Prices stay on this device.</span>
      </footer>

      <CheckoutBar result={calculation.result} />
    </div>
  )
}

function CheckoutBar({
  result,
}: {
  result: ReturnType<typeof optimiseBasket> | null
}) {
  const success = result?.status === 'success' ? result : null
  const saved = success?.savingsVersusSingleShop ?? 0

  return (
    <div className="checkout-bar">
      <div className="checkout-bar-copy">
        {saved > 0 ? <small>Saved {formatAmount(saved)}</small> : null}
        <span>
          Total
          <strong>
            {success ? formatAmount(success.bestPlan.total) : 'RM 0.00'}
          </strong>
        </span>
      </div>
      <a className="checkout-bar-button" href="#recommendation-title">
        Check Out
      </a>
    </div>
  )
}
