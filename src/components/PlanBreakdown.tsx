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
    <div className="plan-breakdown">
      {plan.visitedShopIds.map((shopId) => {
        const shop = shopsById.get(shopId)
        const purchases = plan.purchases.filter(
          (purchase) => purchase.shopId === shopId,
        )

        return (
          <section className="shop-plan" key={shopId}>
            <h3>{shop?.name ?? 'Unknown shop'}</h3>
            <ul>
              {purchases.map((purchase) => {
                const item = itemsById.get(purchase.itemId)

                return (
                  <li key={purchase.itemId}>
                    <span>
                      <strong>{item?.name ?? 'Unknown item'}</strong>
                      <small>
                        {purchase.quantity} × {formatAmount(purchase.unitPrice)}
                      </small>
                    </span>
                    <b>{formatAmount(purchase.total)}</b>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      <dl className="receipt-lines" aria-label="Plan total">
        <div>
          <dt>Items</dt>
          <dd>{formatAmount(plan.itemSubtotal)}</dd>
        </div>
        <div>
          <dt>Extra stop</dt>
          <dd>{formatAmount(plan.extraStopCost)}</dd>
        </div>
        <div className="receipt-total">
          <dt>Total</dt>
          <dd>{formatAmount(plan.total)}</dd>
        </div>
      </dl>
    </div>
  )
}
