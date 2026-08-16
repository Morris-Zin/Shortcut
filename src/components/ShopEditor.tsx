import type { ShopDraft } from '../application/appState'

interface ShopEditorProps {
  shops: ShopDraft[]
  extraStopCost: string
  onAddShop: () => void
  onRemoveShop: (shopId: string) => void
  onRenameShop: (shopId: string, name: string) => void
  onExtraStopCostChange: (value: string) => void
}

export function ShopEditor({
  shops,
  extraStopCost,
  onAddShop,
  onRemoveShop,
  onRenameShop,
  onExtraStopCostChange,
}: ShopEditorProps) {
  return (
    <section className="panel setup-panel" aria-labelledby="shops-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Mall</p>
          <h2 id="shops-title">Where could you shop?</h2>
        </div>
        <button className="button button-secondary" type="button" onClick={onAddShop}>
          <span aria-hidden="true">+</span> Add shop
        </button>
      </div>

      <div className="shop-list">
        {shops.map((shop, index) => (
          <div className="shop-row" key={shop.id}>
            <span className="shop-number" aria-hidden="true">
              {(shop.name.trim()[0] || String(index + 1)).toUpperCase()}
            </span>
            <label className="field grow-field" htmlFor={`shop-${shop.id}`}>
              <span className="visually-hidden">Shop name</span>
              <input
                id={`shop-${shop.id}`}
                type="text"
                value={shop.name}
                placeholder={index === 0 ? 'Store name' : 'Another store'}
                onChange={(event) => onRenameShop(shop.id, event.target.value)}
              />
            </label>
            <button
              className="icon-button"
              type="button"
              aria-label={`Remove ${shop.name || `shop ${index + 1}`}`}
              disabled={shops.length === 1}
              onClick={() => onRemoveShop(shop.id)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>

      <label className="stop-cost" htmlFor="extra-stop-cost">
        <span className="stop-cost-copy">
          <strong>Cost of one extra stop</strong>
          <small>Shipping / extra travel to a second store.</small>
        </span>
        <span className="money-input">
          <span aria-hidden="true">RM</span>
          <input
            id="extra-stop-cost"
            type="text"
            inputMode="decimal"
            value={extraStopCost}
            placeholder="0.00"
            onChange={(event) => onExtraStopCostChange(event.target.value)}
          />
        </span>
      </label>
    </section>
  )
}
