import { useReducer } from 'react'
import './App.css'
import { appReducer } from './application/appReducer'
import { createEmptyState } from './application/appState'
import { sampleState } from './application/sampleData'
import { BasketEditor } from './components/BasketEditor'
import { Recommendation } from './components/Recommendation'
import { ShopEditor } from './components/ShopEditor'

const newId = (prefix: 'shop' | 'item') => `${prefix}-${crypto.randomUUID()}`

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, createEmptyState)

  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        Skip to basket setup
      </a>

      <header className="site-header">
        <a className="wordmark" href="/" aria-label="BasketSplit home">
          <span className="wordmark-mark" aria-hidden="true">
           A/P
          </span>
          <span>BasketSplit</span>
        </a>
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
          <p className="intro-kicker">A smarter shopping</p>
          <h1 id="page-title">Know when a second shop is worth the stop.</h1>
          <p>
            Add your basket, enter the prices you know, and account for the real cost of going somewhere else.
          </p>
        </section>

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

          <Recommendation shopCount={state.shops.length} itemCount={state.items.length} />
        </div>
      </main>

      <footer className="site-footer">
        <span>BasketSplit</span>
        <span>Prices stay on this device.</span>
      </footer>
    </div>
  )
}
