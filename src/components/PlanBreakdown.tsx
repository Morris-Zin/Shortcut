import { formatAmount } from '../domain/money'
import type { Basket, Plan } from '../domain/types'

interface PlanBreakdownProps {
  basket: Basket
  plan: Plan
}

export function PlanBreakdown({ basket, plan }: PlanBreakdownProps) {
  const shopsById = new Map(basket.shops.map((shop) => [shop.id, shop]))
  const itemsById = new Map(basket.items.map((item) => [item.id, item]))

  return (
    <div className="grid gap-[0.6rem]">
      {plan.visitedShopIds.map((shopId) => {
        const shop = shopsById.get(shopId)
        const purchases = plan.purchases.filter(
          (purchase) => purchase.shopId === shopId,
        )
        const shopName = shop?.name ?? 'Unknown shop'

        return (
          <section className="rounded-sm border border-rule bg-white p-[0.7rem]" key={shopId}>
            <h3 className="mb-[0.65rem] flex items-center gap-[0.45rem] border-b border-rule pb-[0.55rem] text-[0.88rem]">
              <span
                className="grid size-[1.45rem] place-items-center rounded-full bg-[#f3f3f3] text-[0.7rem] font-extrabold text-brand"
                aria-hidden="true"
              >
                {shopName[0]?.toUpperCase()}
              </span>
              {shopName}
            </h3>
            <ul className="grid list-none gap-[0.55rem] p-0">
              {purchases.map((purchase) => {
                const item = itemsById.get(purchase.itemId)
                const itemName = item?.name ?? 'Unknown item'

                return (
                  <li className="flex items-center gap-[0.6rem]" key={purchase.itemId}>
                    <span
                      className="grid size-[2.4rem] shrink-0 place-items-center rounded-sm bg-[#f3f3f3] text-[0.85rem] font-extrabold text-brand"
                      aria-hidden="true"
                    >
                      {itemName[0]?.toUpperCase()}
                    </span>
                    <span className="grid min-w-0 flex-1">
                      <strong>{itemName}</strong>
                      <small className="text-[0.74rem] text-muted">
                        x{purchase.quantity} · {formatAmount(purchase.unitPrice)}
                      </small>
                    </span>
                    <b className="shrink-0 text-[0.88rem] font-extrabold text-price">
                      {formatAmount(purchase.total)}
                    </b>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      <dl className="mt-[0.15rem] grid" aria-label="Plan total">
        <div className="flex justify-between gap-4 border-b border-rule py-2">
          <dt className="text-muted">Merchandise Subtotal</dt>
          <dd className="font-bold">{formatAmount(plan.itemSubtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-rule py-2">
          <dt className="text-muted">Shipping (extra stop)</dt>
          <dd className="font-bold">{formatAmount(plan.extraStopCost)}</dd>
        </div>
        <div className="mt-[0.15rem] flex justify-between gap-4 pt-[0.7rem] text-[1.2rem] font-extrabold text-price">
          <dt>Total</dt>
          <dd>{formatAmount(plan.total)}</dd>
        </div>
      </dl>
    </div>
  )
}
