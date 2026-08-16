import type {
  Amount,
  Basket,
  Plan,
  Purchase,
  Result,
  Shop,
  ShopId,
  ShopIds,
} from './types'

interface SearchResult {
  bestPlan: Plan | null
  bestSingleShopPlan: Plan | null
}

/**
 * This is brute force can be modeled as a decision tree
 *
 * Each basket item is a level. At that level we try every shop that actually
 * sells the item. When every item has a shop, we are at a leaf node of one full plan.
 * We walk every leaf we can reach and keep the cheapest one.

 *
 *                         START
 *              _____________|_____________
 *             |                           |
 *         Bread->A                    Bread->B
 *        /        \                  /        \
 *   Milk->A      Milk->B        Milk->A      Milk->B
 *   /    \       /    \         /    \       /    \
 * AAA   AAB   ABA   ABB      BAA   BAB    BBA    BBB
 * RM18  RM18  RM16  RM14     RM23  RM21   RM19   RM15
 *                   BEST
 *
 * i write brute force because we can compare the optimized algorithm against this answer
 */
export function optimiseBasketBruteForce(
  input: Basket,
): Result {
  const shops = [...input.shops].sort(compareShops)
  const unavailableItemIds = input.items
    .filter((item) =>
      shops.every((shop) => input.prices[item.id]?.[shop.id] == null),
    )
    .map((item) => item.id)

  if (unavailableItemIds.length > 0) {
    return {
      status: 'infeasible',
      reason: 'unavailable-items',
      unavailableItemIds,
    }
  }

  const result: SearchResult = {
    bestPlan: null,
    bestSingleShopPlan: null,
  }

  searchAssignments(input, shops, 0, [], new Set(), 0, result)

  if (!result.bestPlan) {
    return {
      status: 'infeasible',
      reason: 'requires-more-than-two-shops',
    }
  }

  return {
    status: 'success',
    bestPlan: result.bestPlan,
    bestSingleShopPlan: result.bestSingleShopPlan,
    savingsVersusSingleShop: result.bestSingleShopPlan
      ? result.bestSingleShopPlan.total - result.bestPlan.total
      : null,
  }
}

function searchAssignments(
  input: Basket,
  shops: readonly Shop[],
  itemIndex: number,
  purchases: readonly Purchase[],
  visitedShopIds: ReadonlySet<ShopId>,
  itemSubtotal: Amount,
  result: SearchResult,
): void {
  if (itemIndex === input.items.length) {
    const plan = createPlan(input, shops, purchases, visitedShopIds, itemSubtotal)

    if (!plan) {
      return
    }

    if (!result.bestPlan || isBetterPlan(plan, result.bestPlan, shops)) {
      result.bestPlan = plan
    }

    if (
      plan.visitedShopIds.length === 1 &&
      (!result.bestSingleShopPlan ||
        isBetterPlan(plan, result.bestSingleShopPlan, shops))
    ) {
      result.bestSingleShopPlan = plan
    }

    return
  }

  const item = input.items[itemIndex]

  if (!item) {
    return
  }

  for (const shop of shops) {
    const unitPrice = input.prices[item.id]?.[shop.id]

    if (unitPrice == null) {
      continue
    }

    const nextVisitedShopIds = new Set(visitedShopIds)
    nextVisitedShopIds.add(shop.id)

    if (nextVisitedShopIds.size > 2) {
      continue
    }

    const total = item.quantity * unitPrice
    const purchase: Purchase = {
      itemId: item.id,
      shopId: shop.id,
      quantity: item.quantity,
      unitPrice,
      total,
    }

    searchAssignments(
      input,
      shops,
      itemIndex + 1,
      [...purchases, purchase],
      nextVisitedShopIds,
      itemSubtotal + total,
      result,
    )
  }
}

function createPlan(
  input: Basket,
  shops: readonly Shop[],
  purchases: readonly Purchase[],
  visitedShopIds: ReadonlySet<ShopId>,
  itemSubtotal: Amount,
): Plan | null {
  const orderedShopIds = shops
    .filter((shop) => visitedShopIds.has(shop.id))
    .map((shop) => shop.id)

  let visitedShops: ShopIds

  if (orderedShopIds.length === 1) {
    visitedShops = [orderedShopIds[0]!]
  } else if (orderedShopIds.length === 2) {
    visitedShops = [orderedShopIds[0]!, orderedShopIds[1]!]
  } else {
    return null
  }

  const extraStopCost = visitedShops.length === 2 ? input.extraStopCost : 0

  return {
    visitedShopIds: visitedShops,
    purchases: [...purchases],
    itemSubtotal,
    extraStopCost,
    total: itemSubtotal + extraStopCost,
  }
}

// Same-cost plans: fewer shops, then earlier list position, then shop id.
// That keeps a one-stop trip when a second stop does not actually save money.
function isBetterPlan(
  candidate: Plan,
  current: Plan,
  shops: readonly Shop[],
): boolean {
  if (candidate.total !== current.total) {
    return candidate.total < current.total
  }

  if (candidate.visitedShopIds.length !== current.visitedShopIds.length) {
    return candidate.visitedShopIds.length < current.visitedShopIds.length
  }

  const orderByShopId = new Map(shops.map((shop) => [shop.id, shop.order]))

  for (let index = 0; index < candidate.visitedShopIds.length; index += 1) {
    const candidateShopId = candidate.visitedShopIds[index]
    const currentShopId = current.visitedShopIds[index]

    if (!candidateShopId || !currentShopId) {
      continue
    }

    const candidateOrder = orderByShopId.get(candidateShopId) ?? Infinity
    const currentOrder = orderByShopId.get(currentShopId) ?? Infinity

    if (candidateOrder !== currentOrder) {
      return candidateOrder < currentOrder
    }

    if (candidateShopId !== currentShopId) {
      return candidateShopId < currentShopId
    }
  }

  return false
}

function compareShops(left: Shop, right: Shop): number {
  return left.order - right.order || left.id.localeCompare(right.id)
}
