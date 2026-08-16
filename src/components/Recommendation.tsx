import { formatAmount } from '../domain/money'
import type { Basket, Result } from '../domain/types'
import { PlanBreakdown } from './PlanBreakdown'

interface RecommendationProps {
  basket: Basket | null
  errors: readonly string[]
  result: Result | null
}

export function Recommendation({
  basket,
  errors,
  result,
}: RecommendationProps) {
  return (
    <aside
      className="recommendation"
      aria-labelledby="recommendation-title"
      aria-live="polite"
    >
      <div className="receipt-topline" aria-hidden="true" />
      <p className="eyebrow">Check Out</p>
      <h2 id="recommendation-title">Your cheapest plan</h2>

      {!basket || !result ? (
        <InputMessage errors={errors} />
      ) : result.status === 'infeasible' ? (
        <InfeasibleMessage basket={basket} result={result} />
      ) : (
        <SuccessMessage basket={basket} result={result} />
      )}
    </aside>
  )
}

function InputMessage({ errors }: { errors: readonly string[] }) {
  return (
    <div className="result-message result-input">
      <span className="placeholder-mark" aria-hidden="true">→</span>
      <div>
        <strong>Finish setting up your basket</strong>
        {errors.length > 0 ? (
          <ul className="input-errors">
            {errors.slice(0, 4).map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : (
          <p>Add your shops, items and prices to see a plan.</p>
        )}
      </div>
    </div>
  )
}

function InfeasibleMessage({
  basket,
  result,
}: {
  basket: Basket
  result: Extract<Result, { status: 'infeasible' }>
}) {
  let explanation: string

  if (result.reason === 'unavailable-items') {
    const names = result.unavailableItemIds.map(
      (itemId) => basket.items.find((item) => item.id === itemId)?.name ?? 'Unknown item',
    )
    explanation = `${names.join(', ')} cannot be bought from any entered shop.`
  } else {
    explanation =
      'Every item is available somewhere, but no combination of one or two shops covers the basket.'
  }

  return (
    <div className="result-message result-warning">
      <span className="placeholder-mark" aria-hidden="true">!</span>
      <div>
        <strong>No valid plan yet</strong>
        <p>{explanation}</p>
      </div>
    </div>
  )
}

function SuccessMessage({
  basket,
  result,
}: {
  basket: Basket
  result: Extract<Result, { status: 'success' }>
}) {
  const plan = result.bestPlan
  const shopNames = plan.visitedShopIds.map(
    (shopId) => basket.shops.find((shop) => shop.id === shopId)?.name ?? 'Unknown shop',
  )
  const isSplit = plan.visitedShopIds.length === 2

  let explanation: string

  if (isSplit && result.bestSingleShopPlan) {
    const itemSaving = result.bestSingleShopPlan.itemSubtotal - plan.itemSubtotal
    explanation = `Splitting saves ${formatAmount(itemSaving)} on items. After the ${formatAmount(plan.extraStopCost)} extra stop, you save ${formatAmount(result.savingsVersusSingleShop ?? 0)} overall.`
  } else if (isSplit) {
    explanation =
      'No single shop covers every item. This is the cheapest valid two-shop plan.'
  } else {
    explanation =
      'Buying everything at one shop is cheapest after accounting for the extra-stop cost.'
  }

  return (
    <>
      <div className="result-message result-success">
        <span className="placeholder-mark" aria-hidden="true">✓</span>
        <div>
          <strong>
            {isSplit ? `Split between ${shopNames.join(' and ')}` : `Shop at ${shopNames[0]}`}
          </strong>
          <p>{explanation}</p>
        </div>
      </div>
      <PlanBreakdown basket={basket} plan={plan} />
    </>
  )
}
