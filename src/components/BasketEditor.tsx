import type { BasketItemDraft, ShopDraft } from '../application/appState'
import { BasketItemEditor } from './BasketItemEditor'

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
    <section
      className="rounded-sm bg-surface px-4 pt-[0.9rem] pb-4 shadow-[0_1px_1px_rgb(0_0_0_/_0.04)]"
      aria-labelledby="basket-title"
    >
      <div className="mb-[0.85rem] flex items-center justify-between gap-4">
        <div className="grid gap-[0.1rem]">
          <p className="text-[0.78rem] font-extrabold text-brand">
            Shopping Cart ({items.length})
          </p>
          <h2 className="text-[1.05rem] leading-tight" id="basket-title">
            Build your basket
          </h2>
        </div>
        <button
          className="inline-flex min-h-9 items-center justify-center gap-[0.35rem] rounded-sm bg-brand px-[0.9rem] py-[0.45rem] text-[0.88rem] font-bold text-white hover:bg-brand-dark motion-safe:transition-colors"
          type="button"
          onClick={onAddItem}
        >
          <span aria-hidden="true">+</span> Add item
        </button>
      </div>

      <div className="grid gap-[0.55rem]">
        {items.map((item, index) => (
          <BasketItemEditor
            key={item.id}
            item={item}
            index={index}
            shops={shops}
            canRemove={items.length > 1}
            onRemove={onRemoveItem}
            onRename={onRenameItem}
            onQuantityChange={onQuantityChange}
            onPriceChange={onPriceChange}
          />
        ))}
      </div>

      <button
        className="mt-[0.7rem] flex w-full items-center justify-center gap-[0.45rem] rounded-sm border border-dashed border-peach-line bg-peach-soft p-[0.7rem] font-bold text-brand hover:border-solid hover:bg-peach motion-safe:transition-colors"
        type="button"
        onClick={onAddItem}
      >
        <span aria-hidden="true">+</span>
        <span>Add another basket item</span>
      </button>
    </section>
  )
}
