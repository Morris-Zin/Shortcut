import { PlanBreakdown } from './PlanBreakdown'

interface RecommendationProps {
  shopCount: number
  itemCount: number
}

export function Recommendation({ shopCount, itemCount }: RecommendationProps) {
  return (
    <aside className="recommendation" aria-labelledby="recommendation-title">
      <div className="receipt-topline" aria-hidden="true" />
      <p className="eyebrow">Step 3</p>
      <h2 id="recommendation-title">Your cheapest plan</h2>

      <div className="result-placeholder">
        <span className="placeholder-mark" aria-hidden="true">↗</span>
        <div>
          <strong>Ready for the optimiser</strong>
          <p>
            Your recommendation will appear here once the calculation layer is connected.
          </p>
        </div>
      </div>

      <PlanBreakdown shopCount={shopCount} itemCount={itemCount} />

      <div className="receipt-note">
        <span aria-hidden="true">◎</span>
        <p>
          BasketSplit will compare one-shop and two-shop plans, including your extra-stop cost.
        </p>
      </div>
    </aside>
  )
}
