import type {
  Basket,
  Plan,
  Purchase,
  Result,
  Shop,
  ShopIds,
} from './types'

/**
 * Brute force asks "which shop for this item?" at every item, so the tree
 * grows with the basket. This one asks "which shops do we visit?" first.
 *
 * With shops A and B that is only three candidates, not eight item-leaves:
 *
 *                         START
 *              _____________|_____________
 *             |             |             |
 *            {A}           {B}          {A,B}
 *         all at A      all at B     each item
 *                                    cheaper of A/B
 *             |             |             |
 *          one plan      one plan      one plan
 *                         pick cheapest
 *
 * A third shop only adds more shop-sets ({C}, {A,C}, {B,C}), not a new
 * tree level per item. Extra-stop cost is added on the two-shop sets.
 */
export function optimiseBasket(basket: Basket): Result {
  const shops = [...basket.shops].sort(compareShops)
  const unavailableItemIds = basket.items
    .filter((item) =>
      shops.every((shop) => basket.prices[item.id]?.[shop.id] == null),
    )
    .map((item) => item.id)

  if (unavailableItemIds.length > 0) {
    return {
      status: 'infeasible',
      reason: 'unavailable-items',
      unavailableItemIds,
    }
  }

  const singleShopPlans: Plan[] = []
  const allPlans: Plan[] = []

  for (const shop of shops) {
    const plan = makePlan(basket, [shop])

    if (plan) {
      singleShopPlans.push(plan)
      allPlans.push(plan)
    }
  }

  for (let first = 0; first < shops.length; first += 1) {
    for (let second = first + 1; second < shops.length; second += 1) {
      const firstShop = shops[first]
      const secondShop = shops[second]

      if (!firstShop || !secondShop) {
        continue
      }

      const plan = makePlan(basket, [firstShop, secondShop])

      if (plan) {
        allPlans.push(plan)
      }
    }
  }

  const bestPlan = pickBest(allPlans, shops)
  const bestSingleShopPlan = pickBest(singleShopPlans, shops)

  if (!bestPlan) {
    return {
      status: 'infeasible',
      reason: 'requires-more-than-two-shops',
    }
  }

  return {
    status: 'success',
    bestPlan,
    bestSingleShopPlan,
    savingsVersusSingleShop: bestSingleShopPlan
      ? bestSingleShopPlan.total - bestPlan.total
      : null,
  }
}

function makePlan(basket: Basket, shops: readonly Shop[]): Plan | null {
  const purchases: Purchase[] = []
  const visitedShopIds = new Set<string>()
  let itemSubtotal = 0

  for (const item of basket.items) {
    let chosenShop: Shop | null = null
    let chosenPrice: number | null = null

    for (const shop of shops) {
      const price = basket.prices[item.id]?.[shop.id]

      if (price == null) {
        continue
      }

      if (
        chosenPrice === null ||
        price < chosenPrice ||
        (price === chosenPrice &&
          chosenShop !== null &&
          compareShops(shop, chosenShop) < 0)
      ) {
        chosenShop = shop
        chosenPrice = price
      }
    }

    if (!chosenShop || chosenPrice === null) {
      return null
    }

    const total = item.quantity * chosenPrice

    purchases.push({
      itemId: item.id,
      shopId: chosenShop.id,
      quantity: item.quantity,
      unitPrice: chosenPrice,
      total,
    })

    visitedShopIds.add(chosenShop.id)
    itemSubtotal += total
  }

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

  const extraStopCost = visitedShops.length === 2 ? basket.extraStopCost : 0

  return {
    visitedShopIds: visitedShops,
    purchases,
    itemSubtotal,
    extraStopCost,
    total: itemSubtotal + extraStopCost,
  }
}

function pickBest(plans: readonly Plan[], shops: readonly Shop[]): Plan | null {
  let bestPlan: Plan | null = null

  for (const plan of plans) {
    if (!bestPlan || isBetter(plan, bestPlan, shops)) {
      bestPlan = plan
    }
  }

  return bestPlan
}

// Same-cost plans: fewer shops, then earlier list position, then shop id.
// That keeps a one-stop trip when a second stop does not actually save money.
function isBetter(candidate: Plan, current: Plan, shops: readonly Shop[]): boolean {
  if (candidate.total !== current.total) {
    return candidate.total < current.total
  }

  if (candidate.visitedShopIds.length !== current.visitedShopIds.length) {
    return candidate.visitedShopIds.length < current.visitedShopIds.length
  }

  const orderByShopId = new Map(shops.map((shop) => [shop.id, shop.order]))

  for (let index = 0; index < candidate.visitedShopIds.length; index += 1) {
    const candidateId = candidate.visitedShopIds[index]
    const currentId = current.visitedShopIds[index]

    if (!candidateId || !currentId) {
      continue
    }

    const candidateOrder = orderByShopId.get(candidateId) ?? Infinity
    const currentOrder = orderByShopId.get(currentId) ?? Infinity

    if (candidateOrder !== currentOrder) {
      return candidateOrder < currentOrder
    }

    if (candidateId !== currentId) {
      return candidateId < currentId
    }
  }

  return false
}

function compareShops(left: Shop, right: Shop): number {
  return left.order - right.order || left.id.localeCompare(right.id)
}
