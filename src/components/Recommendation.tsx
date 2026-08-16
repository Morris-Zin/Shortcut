import type { ReactNode } from 'react'
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
      className="sticky top-[4.1rem] overflow-hidden rounded-sm bg-surface px-[1.05rem] pt-4 pb-[1.1rem] shadow-[0_1px_1px_rgb(0_0_0_/_0.04)] max-[850px]:static"
      aria-labelledby="recommendation-title"
      aria-live="polite"
    >
      <div className="-mx-[1.05rem] -mt-4 mb-[0.85rem] h-[0.22rem] bg-brand" aria-hidden="true" />
      <p className="text-[0.78rem] font-extrabold text-brand">Recommendation</p>
      <h2 className="mt-[0.15rem] text-[1.05rem] leading-tight" id="recommendation-title">
        Your cheapest plan
      </h2>

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

function ResultBanner({
  mark,
  markClassName,
  boxClassName,
  title,
  children,
}: {
  mark: string
  markClassName: string
  boxClassName: string
  title: string
  children: ReactNode
}) {
  return (
    <div className={`my-[0.85rem] flex gap-3 rounded-sm p-3 ${boxClassName}`}>
      <span
        className={`grid size-[1.7rem] shrink-0 place-items-center rounded-full text-[0.9rem] text-white ${markClassName}`}
        aria-hidden="true"
      >
        {mark}
      </span>
      <div>
        <strong>{title}</strong>
        {children}
      </div>
    </div>
  )
}

function InputMessage({ errors }: { errors: readonly string[] }) {
  return (
    <ResultBanner
      mark="→"
      markClassName="bg-brand"
      boxClassName="bg-paper"
      title="Finish setting up your basket"
    >
      {errors.length > 0 ? (
        <ul className="mt-[0.45rem] grid list-disc gap-[0.2rem] pl-[1.05rem] text-[0.8rem] text-muted">
          {errors.slice(0, 4).map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-[0.2rem] text-[0.84rem] text-muted">
          Add your shops, items and prices to see a plan.
        </p>
      )}
    </ResultBanner>
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
    <ResultBanner
      mark="!"
      markClassName="bg-danger"
      boxClassName="bg-peach text-brand-dark"
      title="No valid plan yet"
    >
      <p className="mt-[0.2rem] text-[0.84rem] text-muted">{explanation}</p>
    </ResultBanner>
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
      <ResultBanner
        mark="✓"
        markClassName="bg-success"
        boxClassName="bg-success-soft text-success-ink"
        title={isSplit ? `Split between ${shopNames.join(' and ')}` : `Shop at ${shopNames[0]}`}
      >
        <p className="mt-[0.2rem] text-[0.84rem] text-muted">{explanation}</p>
      </ResultBanner>
      <PlanBreakdown basket={basket} plan={plan} />
    </>
  )
}
