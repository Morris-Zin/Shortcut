import type { BasketItemDraft, ShopDraft } from '../application/appState'

interface BasketEditorProps {
  items: BasketItemDraft[]
  shops: ShopDraft[]
  onAddItem: () => void
  onRemoveItem: (itemId: string) => void
  onRenameItem: (itemId: string, name: string) => void
  onQuantityChange: (itemId: string, quantity: string) => void
  onPriceChange: (itemId: string, shopId: string, price: string) => void
}

export function BasketEditor({
  items,
  shops,
  onAddItem,
  onRemoveItem,
  onRenameItem,
  onQuantityChange,
  onPriceChange,
}: BasketEditorProps) {
  return (
    <section className="panel basket-panel" aria-labelledby="basket-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Step 2</p>
          <h2 id="basket-title">Build your basket</h2>
          <p className="section-note">Leave a price empty when a shop does not carry that item.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={onAddItem}>
          <span aria-hidden="true">+</span> Add item
        </button>
      </div>

      <div className="item-list">
        {items.map((item, index) => (
          <article className="item-card" key={item.id}>
            <div className="item-card-heading">
              <span className="item-count">Item {index + 1}</span>
              <button
                className="text-button"
                type="button"
                disabled={items.length === 1}
                onClick={() => onRemoveItem(item.id)}
              >
                Remove
              </button>
            </div>

            <div className="item-basics">
              <label className="field grow-field" htmlFor={`item-name-${item.id}`}>
                <span>Item</span>
                <input
                  id={`item-name-${item.id}`}
                  type="text"
                  value={item.name}
                  placeholder="e.g. Fresh milk"
                  onChange={(event) => onRenameItem(item.id, event.target.value)}
                />
              </label>
              <label className="field quantity-field" htmlFor={`item-quantity-${item.id}`}>
                <span>Quantity</span>
                <input
                  id={`item-quantity-${item.id}`}
                  type="text"
                  inputMode="numeric"
                  value={item.quantity}
                  onChange={(event) => onQuantityChange(item.id, event.target.value)}
                />
              </label>
            </div>

            <fieldset className="price-fields">
              <legend>Unit price at each shop</legend>
              <div className="price-grid">
                {shops.map((shop, shopIndex) => (
                  <label className="field" key={shop.id} htmlFor={`price-${item.id}-${shop.id}`}>
                    <span>{shop.name || `Shop ${shopIndex + 1}`}</span>
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
                ))}
              </div>
            </fieldset>
          </article>
        ))}
      </div>

      <button className="add-item-button" type="button" onClick={onAddItem}>
        <span aria-hidden="true">+</span>
        <span>Add another basket item</span>
      </button>
    </section>
  )
}
