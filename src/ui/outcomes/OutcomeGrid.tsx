import type { LucideIcon } from 'lucide-react'
import { Clock, FileOutput, GitBranch, Tags } from 'lucide-react'
import type { Outcome } from '../../content'
import { content } from '../../content'
import { Button, Icon } from '../primitives'
import './outcomes.css'

const GROUPS = ['Delivery', 'Metadata', 'Timing', 'Graphs'] as const

const groupIcons: Readonly<Record<(typeof GROUPS)[number], LucideIcon>> = {
  Delivery: FileOutput,
  Metadata: Tags,
  Timing: Clock,
  Graphs: GitBranch,
}

export type OutcomeGridProps = {
  readonly outcomes?: readonly Outcome[]
  readonly onSelect: (id: string) => void
}

export function OutcomeGrid({ outcomes = content.outcomes, onSelect }: OutcomeGridProps) {
  const grouped = GROUPS.map((group) => ({
    group,
    items: outcomes.filter((outcome) => outcome.group === group),
  })).filter((entry) => entry.items.length > 0)

  const ungrouped = outcomes.filter((outcome) => !outcome.group || !GROUPS.includes(outcome.group))

  return (
    <section className="outcome-grid" aria-label="Outcomes">
      {grouped.map(({ group, items }) => (
        <div className="outcome-grid__group" key={group}>
          <h2 className="outcome-grid__group-label">{group}</h2>
          <ul className="outcome-grid__list">
            {items.map((outcome) => (
              <li className="outcome-grid__item" key={outcome.id}>
                <Button
                  className="outcome-card"
                  variant="quiet"
                  onClick={() => onSelect(outcome.id)}
                >
                  <Icon
                    icon={groupIcons[group]}
                    size={18}
                    strokeWidth={1.5}
                    className="outcome-card__icon"
                  />
                  <span className="outcome-card__label">{outcome.label}</span>
                  <span className="outcome-card__sentence">
                    {outcome.sentence ?? outcome.label}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {ungrouped.length > 0 ? (
        <ul className="outcome-grid__list">
          {ungrouped.map((outcome) => (
            <li className="outcome-grid__item" key={outcome.id}>
              <Button className="outcome-card" variant="quiet" onClick={() => onSelect(outcome.id)}>
                <span className="outcome-card__label">{outcome.label}</span>
                <span className="outcome-card__sentence">{outcome.sentence ?? outcome.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
