import { describe, expect, it } from 'vitest'
import { latestProgressUpdate, parseProgressLine } from './index'

const SAMPLE =
  'frame=  512 fps=128 q=31.0 size=    1024kB time=00:00:20.48 bitrate= 409.6kbits/s speed=5.12x'
const FINAL =
  'frame= 1000 fps= 25 q=-1.0 Lsize=    2048kB time=00:00:40.00 bitrate= 419.4kbits/s speed=1.00x'
const NA = 'frame=0 fps=0.0 q=0.0 size=       0kB time=00:00:00.00 bitrate=N/A speed=   N/A'

describe('parseProgressLine', () => {
  it('parses a real ffmpeg progress line', () => {
    expect(parseProgressLine(SAMPLE)).toEqual({
      raw: SAMPLE,
      frame: 512,
      fps: 128,
      size: '1024kB',
      time: '00:00:20.48',
      bitrate: '409.6kbits/s',
      speed: '5.12x',
    })
  })

  it('parses the final Lsize progress line', () => {
    expect(parseProgressLine(FINAL)).toEqual({
      raw: FINAL,
      frame: 1000,
      fps: 25,
      size: '2048kB',
      time: '00:00:40.00',
      bitrate: '419.4kbits/s',
      speed: '1.00x',
    })
  })

  it('handles carriage-return updates', () => {
    const line = `\r${SAMPLE}`
    expect(parseProgressLine(line)).toEqual({
      raw: SAMPLE,
      frame: 512,
      fps: 128,
      size: '1024kB',
      time: '00:00:20.48',
      bitrate: '409.6kbits/s',
      speed: '5.12x',
    })
  })

  it('ignores N/A numeric and string fields', () => {
    expect(parseProgressLine(NA)).toEqual({
      raw: NA,
      frame: 0,
      fps: 0,
      size: '0kB',
      time: '00:00:00.00',
    })
  })

  it('returns null for unknown lines', () => {
    expect(parseProgressLine('ffmpeg version 7.0 Copyright')).toBeNull()
    expect(parseProgressLine('')).toBeNull()
    expect(parseProgressLine('   ')).toBeNull()
  })

  it('never throws on malformed input', () => {
    const malformed = [
      'time=',
      'frame=not-a-number fps=also-bad',
      'size=\u0000bad',
      'progress=end',
      '====',
      '\n\r\t',
    ]
    for (const line of malformed) {
      expect(() => parseProgressLine(line)).not.toThrow()
    }
    expect(parseProgressLine('frame=not-a-number time=00:00:01.00')).toEqual({
      raw: 'frame=not-a-number time=00:00:01.00',
      time: '00:00:01.00',
    })
  })
})

describe('latestProgressUpdate', () => {
  it('returns the latest parsed update from lines', () => {
    const lines = ['ffmpeg version 7.0', SAMPLE, `\r${FINAL}`, 'progress=end']
    expect(latestProgressUpdate(lines)?.frame).toBe(1000)
    expect(latestProgressUpdate(lines)?.size).toBe('2048kB')
  })

  it('accepts a carriage-return separated stream', () => {
    const stream = `ffmpeg version 7.0\r${SAMPLE}\r${FINAL}`
    expect(latestProgressUpdate(stream)).toEqual(parseProgressLine(FINAL))
  })

  it('returns null when no progress lines exist', () => {
    expect(latestProgressUpdate(['hello', 'world'])).toBeNull()
    expect(latestProgressUpdate('')).toBeNull()
  })
})
