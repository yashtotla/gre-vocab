import { useState } from 'react'
import { WordCard } from './WordCard'
import { GroupSelector } from './GroupSelector'
import { useWordGroups } from '@/hooks/useWordGroups'

export function WordBrowser() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const { wordGroups, isLoading } = useWordGroups()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">GRE Vocabulary</h1>
      <div className="space-y-6">
        <GroupSelector
          wordGroups={wordGroups}
          selectedGroup={selectedGroup}
          onGroupSelect={setSelectedGroup}
        />

        {/* Words in Selected Group */}
        {selectedGroup && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wordGroups
              ?.find(g => g.group === selectedGroup)
              ?.words.map(word => (
                <WordCard key={word.slug} word={word} />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
