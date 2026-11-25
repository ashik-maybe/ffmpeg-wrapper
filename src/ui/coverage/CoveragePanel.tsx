import { spec, filterDetails, encoderDetails } from '../../spec/index'
import muxers from '../../spec/muxers.json'
import { cn } from '../primitives/cn'
import './coverage.css'

export interface CoveragePanelProps {
  readonly className?: string
}

interface CoverageRow {
  readonly label: string
  readonly count: number
}

const rows: readonly CoverageRow[] = [
  { label: 'Options', count: spec.options.length },
  { label: 'Filters', count: filterDetails.length },
  { label: 'Encoders', count: encoderDetails.length },
  { label: 'Muxers', count: muxers.length },
]

export function CoveragePanel({ className }: CoveragePanelProps) {
  return (
    <section className={cn('ui-coverage', className)} aria-label="Coverage">
      <table className="ui-coverage__table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col" className="ui-coverage__count">
              Count
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td className="ui-coverage__count">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="ui-coverage__note">
        Raw arguments are unverified and combinations are not executed in the browser.
      </p>
    </section>
  )
}
