import { parseAmount } from '../domain/money'
import type { BasketItemDraft, ShopDraft } from '../application/appState'

interface BasketEditorProps {
  items: BasketItemDraft[]
  shops: ShopDraft[]
  query: string
  onAddItem: () => void
  onRemoveItem: (itemId: string) => void
  onRenameItem: (itemId: string, name: string) => void
  onQuantityChange: (itemId: string, quantity: string) => void
  onPriceChange: (itemId: string, shopId: string, price: string) => void
}

export function BasketEditor({
  items,
  shops,
  query,
  onAddItem,
  onRemoveItem,
  onRenameItem,
  onQuantityChange,
  onPriceChange,
}: BasketEditorProps) {
  const needle = query.trim().toLowerCase()
  const visibleItems = needle
    ? items.filter((item) => item.name.toLowerCase().includes(needle))
    : items

  return (
    <section className="panel basket-panel" aria-labelledby="basket-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Shopping Cart ({items.length})</p>
          <h2 id="basket-title">Build your basket</h2>
        </div>
        <button className="button button-secondary" type="button" onClick={onAddItem}>
          <span aria-hidden="true">+</span> Add item
        </button>
      </div>

      <div className="item-list">
        {visibleItems.map((item) => {
          const index = items.indexOf(item)
          const lowest = lowestPrice(item, shops)

          return (
            <article className="item-card" key={item.id}>
              <span className="item-thumb" aria-hidden="true">
                {(item.name.trim()[0] || String(index + 1)).toUpperCase()}
              </span>

              <div className="item-card-main">
                <div className="item-card-heading">
                  <input
                    id={`item-name-${item.id}`}
                    className="item-name-input"
                    type="text"
                    value={item.name}
                    placeholder="Product name"
                    aria-label={`Item ${index + 1} name`}
                    onChange={(event) => onRenameItem(item.id, event.target.value)}
                  />
                  <button
                    className="text-button"
                    type="button"
                    disabled={items.length === 1}
                    onClick={() => onRemoveItem(item.id)}
                  >
                    Delete
                  </button>
                </div>

                <div className="qty-stepper">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of item ${index + 1}`}
                    disabled={Number.parseInt(item.quantity, 10) <= 1}
                    onClick={() =>
                      onQuantityChange(item.id, stepQuantity(item.quantity, -1))
                    }
                  >
                    −
                  </button>
                  <input
                    id={`item-quantity-${item.id}`}
                    type="text"
                    inputMode="numeric"
                    value={item.quantity}
                    aria-label={`Quantity of item ${index + 1}`}
                    onChange={(event) => onQuantityChange(item.id, event.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={`Increase quantity of item ${index + 1}`}
                    onClick={() =>
                      onQuantityChange(item.id, stepQuantity(item.quantity, 1))
                    }
                  >
                    +
                  </button>
                </div>

                <div className="price-grid">
                  {shops.map((shop, shopIndex) => {
                    const amount = parseAmount(item.prices[shop.id] ?? '')
                    const isLowest = lowest !== null && amount === lowest

                    return (
                      <label
                        className={isLowest ? 'seller-price is-lowest' : 'seller-price'}
                        key={shop.id}
                        htmlFor={`price-${item.id}-${shop.id}`}
                      >
                        <span className="seller-name">
                          {shop.name || `Shop ${shopIndex + 1}`}
                        </span>
                        {isLowest ? <span className="lowest-tag">Lowest</span> : null}
                        <span className="money-input compact-money-input">
                          <span aria-hidden="true">RM</span>
                          <input
                            id={`price-${item.id}-${shop.id}`}
                            type="text"
                            inputMode="decimal"
                            value={item.prices[shop.id] ?? ''}
                            placeholder="—"
                            onChange={(event) =>
                              onPriceChange(item.id, shop.id, event.target.value)
                            }
                          />
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {visibleItems.length === 0 ? (
        <p className="empty-cart">No items match your search.</p>
      ) : null}

      <button className="add-item-button" type="button" onClick={onAddItem}>
        <span aria-hidden="true">+</span>
        <span>Add another basket item</span>
      </button>
    </section>
  )
}

function stepQuantity(value: string, delta: number): string {
  const parsed = Number.parseInt(value, 10)
  const current = Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  return String(Math.max(1, current + delta))
}

function lowestPrice(item: BasketItemDraft, shops: ShopDraft[]): number | null {
  const prices = shops
    .map((shop) => parseAmount(item.prices[shop.id] ?? ''))
    .filter((price): price is number => price !== null)

  return prices.length > 0 ? Math.min(...prices) : null
}
