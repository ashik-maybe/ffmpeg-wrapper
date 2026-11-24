/**
 * Shape of the app's user-facing content. This file holds no strings:
 * every text lives in code and is routed through the content modules.
 */

export interface ContentSlot {
  readonly slot: string
  readonly variant: string
}

export interface Heading extends ContentSlot {
  readonly tone: 'display' | 'ui'
}

export interface Body extends ContentSlot {
  readonly tone: 'body' | 'ui'
}

export interface Button extends ContentSlot {
  readonly variant: 'primary' | 'secondary' | 'quiet'
}

export interface Label extends ContentSlot {
  readonly role: 'field' | 'tooltip' | 'caption'
}

export interface Alert extends ContentSlot {
  readonly severity: 'error' | 'warning' | 'info'
}

export type ContentItem = Heading | Body | Button | Label | Alert
