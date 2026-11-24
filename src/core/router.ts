import type { Route } from './types'

/** Read a shareable state from the URL hash. */
export function parseHash(hash: string): Route {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const routeParams: Record<string, string> = {}
  for (const [key, value] of params) routeParams[key] = value
  return { page: params.get('page') ?? 'home', params: routeParams }
}

/** Write a shareable state to the URL hash. */
export function buildHash(route: Route): string {
  const params = new URLSearchParams()
  params.set('page', route.page)
  for (const [key, value] of Object.entries(route.params)) {
    if (key !== 'page') params.set(key, value)
  }
  return `#${params.toString()}`
}
