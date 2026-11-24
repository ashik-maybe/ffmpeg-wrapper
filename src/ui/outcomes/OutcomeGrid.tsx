import type { LucideIcon } from 'lucide-react'
import { Combine, Crop, Gauge, Scissors, Scale } from 'lucide-react'
import type { Outcome } from '../../content'
import { content } from '../../content'
import { Button, Icon } from '../primitives'
import './outcomes.css'

const icons: Readonly<Partial<Record<string, LucideIcon>>> = {
  trim: Scissors,
  crop: Crop,
  scale: Scale,
  concat: Combine,
  speed: Gauge,
}

const sentences: Readonly<Partial<Record<string, string>>> = {
  trim: 'Cut the start of the clip',
  crop: 'Remove the edges of the frame',
  scale: 'Change the size of the video',
  concat: 'Join two clips into one',
  speed: 'Change the playback speed',
}

export type OutcomeGridProps = {
  readonly outcomes?: readonly Outcome[]
  readonly onSelect: (id: string) => void
}

export function OutcomeGrid({ outcomes = content.outcomes, onSelect }: OutcomeGridProps) {
  return (
    <section className="outcome-grid" aria-label="Outcomes">
      <ul className="outcome-grid__list">
        {outcomes.map((outcome) => (
          <li className="outcome-grid__item" key={outcome.id}>
            <Button className="outcome-card" variant="quiet" onClick={() => onSelect(outcome.id)}>
              <Icon
                icon={icons[outcome.id] ?? Scissors}
                size={18}
                strokeWidth={1.5}
                className="outcome-card__icon"
              />
              <span className="outcome-card__label">{outcome.label}</span>
              <span className="outcome-card__sentence">
                {sentences[outcome.id] ?? outcome.label}
              </span>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
