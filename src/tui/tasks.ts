import { content } from '../content/index.ts'
import { recipes } from '../recipes/index.ts'

export interface Task {
  readonly id: string
  readonly label: string
  readonly hint: string
}

function humanizeId(id: string): string {
  return id
    .split(/[-_]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const contentHintByRecipeId = new Map<string, string>()
const contentLabelByRecipeId = new Map<string, string>()
for (const outcome of content.outcomes) {
  if (!outcome.recipeId) continue
  contentLabelByRecipeId.set(outcome.recipeId, outcome.label)
  if (outcome.sentence) contentHintByRecipeId.set(outcome.recipeId, outcome.sentence)
}

export const CURATED_TASKS: readonly Task[] = [
  { id: 'web-h264', label: 'Convert for web', hint: 'MP4 file for browsers' },
  { id: 'trim-copy', label: 'Trim a clip', hint: 'Cut a section without re-encoding' },
  { id: 'extract-audio', label: 'Extract audio', hint: 'Save the sound as its own file' },
  { id: 'palette-gif', label: 'Make a GIF', hint: 'Short animated image from video' },
  { id: 'crf-tuning', label: 'Compress', hint: 'Smaller file with quality control' },
  { id: 'loudnorm', label: 'Normalize loudness', hint: 'Even out volume levels' },
]

const curatedById = new Map(CURATED_TASKS.map((task) => [task.id, task]))

export function allTasks(): readonly Task[] {
  return recipes.map((recipe) => {
    const curated = curatedById.get(recipe.id)
    if (curated) return curated
    const label = contentLabelByRecipeId.get(recipe.id) ?? humanizeId(recipe.id)
    const hint = contentHintByRecipeId.get(recipe.id) ?? `Recipe ${recipe.id}`
    return { id: recipe.id, label, hint }
  })
}
