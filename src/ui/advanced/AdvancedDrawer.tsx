import * as Dialog from '@radix-ui/react-dialog'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import encoders from '../../spec/encoders.json'
import filters from '../../spec/filters.json'
import { Button, Callout, Field, Icon } from '../primitives'
import { Search } from 'lucide-react'

import './advanced.css'

type SpecEntry = {
  readonly name: string
  readonly type: string
  readonly description?: string
}

const filterItems = filters as SpecEntry[]
const encoderItems = encoders as SpecEntry[]

const matchesQuery = (entry: SpecEntry, query: string): boolean =>
  entry.name.toLowerCase().includes(query) ||
  entry.type.toLowerCase().includes(query) ||
  (entry.description ?? '').toLowerCase().includes(query)

type OptionBrowserProps = {
  readonly title: string
  readonly items: readonly SpecEntry[]
  readonly query: string
  readonly onQueryChange: (query: string) => void
  readonly onAdd: (name: string) => void
}

function OptionBrowser({ title, items, query, onQueryChange, onAdd }: OptionBrowserProps) {
  const filtered = useMemo(
    () => items.filter((entry) => matchesQuery(entry, query)),
    [items, query],
  )

  return (
    <section className="ui-advanced__browser" aria-label={title}>
      <h3 className="ui-advanced__browser-title">{title}</h3>
      <div className="ui-advanced__search">
        <Icon icon={Search} className="ui-advanced__search-icon" />
        <input
          type="search"
          className="ui-advanced__search-input"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={`Search ${title}`}
          aria-label={`Search ${title}`}
        />
      </div>
      <ul className="ui-advanced__list">
        {filtered.length === 0 ? (
          <li className="ui-advanced__empty">No matches</li>
        ) : (
          filtered.map((entry) => (
            <li key={entry.name}>
              <button type="button" className="ui-advanced__row" onClick={() => onAdd(entry.name)}>
                <span className="ui-advanced__row-name">{entry.name}</span>
                <span className="ui-advanced__row-type">{entry.type}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}

export type AdvancedDrawerProps = {
  /** Controlled open state of the dialog. */
  readonly open: boolean
  /** Called when the dialog requests an open or close change. */
  readonly onOpenChange: (open: boolean) => void
  /** Custom trigger; defaults to a button labelled "Advanced". */
  readonly trigger?: ReactNode
  /** Called with the raw argument text when the user adds it to the command. */
  readonly onSubmit?: (rawArgs: string) => void
}

export function AdvancedDrawer({ open, onOpenChange, trigger, onSubmit }: AdvancedDrawerProps) {
  const [rawArgs, setRawArgs] = useState('')
  const [filtersQuery, setFiltersQuery] = useState('')
  const [encodersQuery, setEncodersQuery] = useState('')

  const addToArgs = (name: string): void =>
    setRawArgs((value) => (value.trim() ? `${value} ${name}` : name))

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger ?? <Button>Advanced</Button>}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="ui-advanced__overlay" />
        <Dialog.Content className="ui-advanced__content">
          <Dialog.Title className="ui-advanced__title">Advanced command</Dialog.Title>
          <Dialog.Description className="ui-advanced__description">
            Browse filters and encoders, or type raw arguments by hand.
          </Dialog.Description>
          <Callout severity="warning" className="ui-advanced__callout">
            Unverified: the arguments below come straight from the spec, not from a checked command.
          </Callout>
          <Field
            label="Raw arguments"
            htmlFor="ui-advanced-raw-args"
            hint="The command stays unverified until it is checked."
          >
            <textarea
              id="ui-advanced-raw-args"
              className="ui-advanced__raw"
              value={rawArgs}
              onChange={(event) => setRawArgs(event.target.value)}
              rows={3}
              spellCheck={false}
            />
          </Field>
          <OptionBrowser
            title="Filters"
            items={filterItems}
            query={filtersQuery}
            onQueryChange={setFiltersQuery}
            onAdd={addToArgs}
          />
          <OptionBrowser
            title="Encoders"
            items={encoderItems}
            query={encodersQuery}
            onQueryChange={setEncodersQuery}
            onAdd={addToArgs}
          />
          <div className="ui-advanced__actions">
            <Button variant="primary" onClick={() => onSubmit?.(rawArgs)}>
              Add to command
            </Button>
            <Dialog.Close asChild>
              <Button>Close</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
