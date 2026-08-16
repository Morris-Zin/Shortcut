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
        const shopName = shop?.name ?? 'Unknown shop'

        return (
          <section className="shop-plan" key={shopId}>
            <h3>
              <span className="shop-plan-avatar" aria-hidden="true">
                {shopName[0]?.toUpperCase()}
              </span>
              {shopName}
            </h3>
            <ul>
              {purchases.map((purchase) => {
                const item = itemsById.get(purchase.itemId)
                const itemName = item?.name ?? 'Unknown item'

                return (
                  <li key={purchase.itemId}>
                    <span className="plan-item-thumb" aria-hidden="true">
                      {itemName[0]?.toUpperCase()}
                    </span>
                    <span>
                      <strong>{itemName}</strong>
                      <small>
                        x{purchase.quantity} · {formatAmount(purchase.unitPrice)}
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
          <dt>Merchandise Subtotal</dt>
          <dd>{formatAmount(plan.itemSubtotal)}</dd>
        </div>
        <div>
          <dt>Shipping (extra stop)</dt>
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
