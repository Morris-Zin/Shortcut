interface PlanBreakdownProps {
  shopCount: number
  itemCount: number
}

export function PlanBreakdown({ shopCount, itemCount }: PlanBreakdownProps) {
  return (
    <dl className="receipt-lines" aria-label="Basket setup summary">
      <div>
        <dt>Candidate shops</dt>
        <dd>{shopCount}</dd>
      </div>
      <div>
        <dt>Basket items</dt>
        <dd>{itemCount}</dd>
      </div>
      <div className="receipt-total">
        <dt>Estimated total</dt>
        <dd>RM —</dd>
      </div>
    </dl>
  )
}
