import type { Route } from './types'

/**
 * Parse a location hash into a route.
 */
export function parseHash(hash: string): Route {
  void hash
  throw new Error('NotImplemented: parseHash')
}

/**
 * Build a location hash from a route.
 */
export function buildHash(route: Route): string {
  void route
  throw new Error('NotImplemented: buildHash')
}
