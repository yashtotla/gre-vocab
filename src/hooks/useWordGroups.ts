import { useQuery } from '@tanstack/react-query'

interface Word {
  word: string
  slug: string
  group: number
  pronunciation_url: string
  definitions: Array<{
    part_of_speech: string
    definition: string
    example: string | null
    synonyms: Array<string>
  }>
}

interface WordGroup {
  group: number
  words: Array<Word>
}

export function useWordGroups(selectedGroups?: number[]) {
  const { data: wordGroups, isLoading } = useQuery<Array<WordGroup>>({
    queryKey: ['wordGroups'],
    queryFn: async () => {
      const response = await fetch('/data/vocab.json')
      const words: Array<Word> = await response.json()
      
      // Group words by their group number
      const groups = words.reduce((acc: { [key: number]: Array<Word> }, word) => {
        const groupWords = acc[word.group] ?? []
        acc[word.group] = [...groupWords, word]
        return acc
      }, {})

      // Convert to array and sort by group number
      return Object.entries(groups)
        .map(([group, groupWords]) => ({
          group: parseInt(group),
          words: groupWords.sort((a, b) => a.word.localeCompare(b.word))
        }))
        .sort((a, b) => a.group - b.group)
    }
  })

  // Get all available groups
  const availableGroups = wordGroups?.map(g => g.group) ?? []

  // Get words for selected groups
  const selectedWords = selectedGroups
    ? wordGroups
        ?.filter(g => selectedGroups.includes(g.group))
        .flatMap(g => g.words) ?? []
    : []

  // Get all words (useful for global search)
  const allWords = wordGroups?.flatMap(g => g.words) ?? []

  return {
    wordGroups,
    isLoading,
    availableGroups,
    selectedWords,
    allWords
  }
} 