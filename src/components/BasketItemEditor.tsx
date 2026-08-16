import type { BasketItemDraft, ShopDraft } from '../application/appState'
import { parseAmount } from '../domain/money'

interface BasketItemEditorProps {
  item: BasketItemDraft
  index: number
  shops: ShopDraft[]
  canRemove: boolean
  onRemove: (itemId: string) => void
  onRename: (itemId: string, name: string) => void
  onQuantityChange: (itemId: string, quantity: string) => void
  onPriceChange: (itemId: string, shopId: string, price: string) => void
}

export function BasketItemEditor({
  item,
  index,
  shops,
  canRemove,
  onRemove,
  onRename,
  onQuantityChange,
  onPriceChange,
}: BasketItemEditorProps) {
  const lowest = lowestPrice(item, shops)

  return (
    <article className="grid grid-cols-[5.25rem_minmax(0,1fr)] gap-3 rounded-sm border border-rule bg-white p-3 max-[560px]:grid-cols-[4.1rem_minmax(0,1fr)]">
      <span
        className="grid size-[5.25rem] place-items-center rounded-sm bg-[#f3f3f3] text-[1.4rem] font-extrabold text-brand max-[560px]:size-[4.1rem]"
        aria-hidden="true"
      >
        {(item.name.trim()[0] || String(index + 1)).toUpperCase()}
      </span>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-[0.55rem]">
        <div className="flex items-start justify-between gap-2">
          <input
            id={`item-name-${item.id}`}
            className="min-h-[1.8rem] min-w-0 flex-1 border-0 bg-transparent p-0 text-[0.95rem] font-bold text-ink placeholder:text-[#b0b0b0] focus:ring-2 focus:ring-brand/18 focus:outline-none"
            type="text"
            value={item.name}
            placeholder="Product name"
            aria-label={`Item ${index + 1} name`}
            onChange={(event) => onRename(item.id, event.target.value)}
          />
          <button
            className="bg-transparent p-[0.15rem] text-xs font-bold text-muted enabled:hover:text-danger"
            type="button"
            disabled={!canRemove}
            onClick={() => onRemove(item.id)}
          >
            Delete
          </button>
        </div>

        <div className="inline-flex w-[7.4rem] overflow-hidden rounded-sm border border-rule focus-within:ring-2 focus-within:ring-brand/18">
          <button
            className="h-[1.85rem] w-[1.85rem] bg-white text-base text-ink"
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
            className="h-[1.85rem] w-0 flex-1 border-0 border-x border-rule bg-white text-center font-bold focus:outline-none"
            type="text"
            inputMode="numeric"
            value={item.quantity}
            aria-label={`Quantity of item ${index + 1}`}
            onChange={(event) =>
              onQuantityChange(item.id, event.target.value)
            }
          />
          <button
            className="h-[1.85rem] w-[1.85rem] bg-white text-base text-ink"
            type="button"
            aria-label={`Increase quantity of item ${index + 1}`}
            onClick={() =>
              onQuantityChange(item.id, stepQuantity(item.quantity, 1))
            }
          >
            +
          </button>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-[0.45rem] min-[560px]:grid-cols-[repeat(auto-fit,minmax(7.8rem,1fr))]">
          {shops.map((shop, shopIndex) => {
            const amount = parseAmount(item.prices[shop.id] ?? '')
            const isLowest = lowest !== null && amount === lowest

            return (
              <label
                className={
                  isLowest
                    ? 'grid min-w-0 grid-cols-[1fr_auto] gap-x-1.5 gap-y-[0.15rem] rounded-sm border border-brand bg-peach-soft px-2 pt-[0.45rem] pb-[0.4rem]'
                    : 'grid min-w-0 grid-cols-[1fr_auto] gap-x-1.5 gap-y-[0.15rem] rounded-sm border border-rule bg-[#fafafa] px-2 pt-[0.45rem] pb-[0.4rem]'
                }
                key={shop.id}
                htmlFor={`price-${item.id}-${shop.id}`}
              >
                <span className="text-[0.7rem] font-bold text-muted">
                  {shop.name || `Shop ${shopIndex + 1}`}
                </span>
                {isLowest ? (
                  <span className="text-[0.65rem] font-extrabold text-brand uppercase">
                    Lowest
                  </span>
                ) : null}
                <span className="col-span-full flex w-full items-center overflow-hidden bg-transparent focus-within:ring-2 focus-within:ring-brand/18">
                  <span
                    className="shrink-0 pl-2 text-[0.78rem] font-extrabold text-price"
                    aria-hidden="true"
                  >
                    RM
                  </span>
                  <input
                    id={`price-${item.id}-${shop.id}`}
                    className="min-h-[2.1rem] w-0 min-w-0 flex-1 border-0 bg-transparent font-extrabold text-price focus:outline-none"
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
