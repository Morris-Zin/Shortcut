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
    <section
      className="rounded-sm bg-surface px-4 pt-[0.9rem] pb-4 shadow-[0_1px_1px_rgb(0_0_0_/_0.04)]"
      aria-labelledby="shops-title"
    >
      <div className="mb-[0.85rem] flex items-center justify-between gap-4">
        <div className="grid gap-[0.1rem]">
          <p className="text-[0.78rem] font-extrabold text-brand">Mall</p>
          <h2 className="text-[1.05rem] leading-tight" id="shops-title">
            Where could you shop?
          </h2>
        </div>
        <button
          className="inline-flex min-h-9 items-center justify-center gap-[0.35rem] rounded-sm bg-brand px-[0.9rem] py-[0.45rem] text-[0.88rem] font-bold text-white hover:bg-brand-dark motion-safe:transition-colors"
          type="button"
          onClick={onAddShop}
        >
          <span aria-hidden="true">+</span> Add shop
        </button>
      </div>

      <div className="flex flex-wrap gap-[0.55rem]">
        {shops.map((shop, index) => (
          <div
            className="flex min-w-[13rem] flex-[1_1_14rem] items-center gap-2 rounded-sm border border-rule bg-white px-2 py-[0.45rem]"
            key={shop.id}
          >
            <span
              className="grid size-[2.1rem] shrink-0 place-items-center rounded-full bg-peach text-[0.8rem] font-extrabold text-brand"
              aria-hidden="true"
            >
              {(shop.name.trim()[0] || String(index + 1)).toUpperCase()}
            </span>
            <label className="grid min-w-0 flex-1" htmlFor={`shop-${shop.id}`}>
              <span className="sr-only">Shop name</span>
              <input
                className="min-h-[2.2rem] min-w-0 w-full border-0 bg-transparent px-[0.6rem] py-[0.4rem] text-ink placeholder:text-[#b0b0b0] focus:outline-none"
                id={`shop-${shop.id}`}
                type="text"
                value={shop.name}
                placeholder={index === 0 ? 'Store name' : 'Another store'}
                onChange={(event) => onRenameShop(shop.id, event.target.value)}
              />
            </label>
            <button
              className="grid size-8 shrink-0 place-items-center rounded-sm bg-transparent text-[1.2rem] text-muted enabled:hover:bg-peach enabled:hover:text-danger motion-safe:transition-colors"
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

      <label
        className="mt-3 flex items-center justify-between gap-4 border-t border-rule px-[0.8rem] py-[0.7rem] max-[560px]:flex-col max-[560px]:items-stretch"
        htmlFor="extra-stop-cost"
      >
        <span className="grid gap-[0.1rem]">
          <strong>Cost of one extra stop</strong>
          <small className="text-muted">
            Shipping / extra travel to a second store.
          </small>
        </span>
        <span className="flex w-32 items-center overflow-hidden rounded-sm border border-rule bg-white focus-within:ring-2 focus-within:ring-brand/18 max-[560px]:w-full">
          <span className="shrink-0 pl-2 text-[0.78rem] font-extrabold text-price" aria-hidden="true">
            RM
          </span>
          <input
            className="min-h-[2.1rem] w-0 min-w-0 flex-1 border-0 bg-transparent font-extrabold text-price focus:outline-none"
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
