import counts from './counts.json'
import { cn } from '../primitives/cn'
import './coverage.css'

export interface CoveragePanelProps {
  readonly className?: string
}

const rows: ReadonlyArray<readonly [string, number]> = [
  ['Options', counts.options],
  ['Filters', counts.filters],
  ['Encoders', counts.encoders],
  ['Muxers', counts.muxers],
  ['Hwaccels', counts.hwaccels],
  ['Filter details', counts.filterDetails],
  ['Encoder details', counts.encoderDetails],
  ['Decoders', counts.decoders],
  ['Demuxers', counts.demuxers],
  ['Protocols', counts.protocols],
  ['Pixel formats', counts.pixelFormats],
  ['Sample formats', counts.sampleFormats],
  ['Option details', counts.optionDetails],
]

export function CoveragePanel({ className }: CoveragePanelProps) {
  return (
    <section className={cn('ui-coverage', className)}>
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
          {rows.map(([label, count]) => (
            <tr key={label}>
              <td>{label}</td>
              <td className="ui-coverage__count">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="ui-coverage__note">
        Raw arguments are unverified. The browser does not run FFmpeg.
      </p>
      <p className="ui-coverage__note">
        The TUI does the execution. Linux only. Flags: --run, --yes, --force, --unsafe. Stop with
        Ctrl+C.
      </p>
    </section>
  )
}
