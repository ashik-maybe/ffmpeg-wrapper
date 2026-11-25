import { useMemo, useState } from 'react'
import { Box, Text, useInput } from 'ink'
import { KeyHint, StatusBar } from '../components/index.ts'
import { theme } from '../theme.ts'
import { allTasks } from '../tasks.ts'

export interface MoreTasksScreenProps {
  readonly onSelect: (id: string) => void
  readonly onBack: () => void
  readonly embedded?: boolean
}

export function MoreTasksScreen({ onSelect, onBack, embedded = false }: MoreTasksScreenProps) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const tasks = allTasks()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return tasks
    return tasks.filter(
      (task) => task.label.toLowerCase().includes(q) || task.id.toLowerCase().includes(q),
    )
  }, [query, tasks])

  const safeIndex = filtered.length === 0 ? 0 : Math.min(index, filtered.length - 1)

  useInput((input, key) => {
    if (key.escape) {
      onBack()
      return
    }
    if (key.upArrow) {
      if (filtered.length === 0) return
      setIndex((i) => (i - 1 + filtered.length) % filtered.length)
      return
    }
    if (key.downArrow) {
      if (filtered.length === 0) return
      setIndex((i) => (i + 1) % filtered.length)
      return
    }
    if (key.return) {
      const item = filtered[safeIndex]
      if (item) onSelect(item.id)
      return
    }
    if (key.backspace || key.delete) {
      setQuery((q) => q.slice(0, -1))
      setIndex(0)
      return
    }
    if (input === '?') return
    if (input && !key.ctrl && !key.meta) {
      setQuery((q) => q + input)
      setIndex(0)
    }
  })

  return (
    <Box flexDirection="column">
      {!embedded ? <StatusBar left="FFmpeg TUI" right="More tasks" /> : null}
      <Box flexDirection="column" marginTop={embedded ? 0 : 1}>
        <Text>
          <Text color={theme.muted}>Search: </Text>
          <Text>{query === '' ? '-' : query}</Text>
        </Text>
        <Text color={theme.muted}>{filtered.length} matches</Text>
        <Box flexDirection="column" marginTop={1}>
          {filtered.map((task, i) => {
            const selected = i === safeIndex
            return (
              <Text key={task.id}>
                <Text color={selected ? theme.accent : undefined}>{selected ? '>' : ' '}</Text>{' '}
                {i + 1}. {task.label}
                <Text color={theme.muted}> - {task.hint}</Text>
              </Text>
            )
          })}
          {filtered.length === 0 ? <Text color={theme.muted}>No matches</Text> : null}
        </Box>
      </Box>
      {!embedded ? (
        <Box marginTop={1}>
          <KeyHint keys="Up/Down" label="move" />
          <Text> </Text>
          <KeyHint keys="Enter" label="select" />
          <Text> </Text>
          <KeyHint keys="Esc" label="back" />
        </Box>
      ) : null}
    </Box>
  )
}
