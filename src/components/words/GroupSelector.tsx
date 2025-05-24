import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface GroupSelectorProps {
  wordGroups: Array<{ group: number }> | undefined
  selectedGroup: number | null
  onGroupSelect: (group: number) => void
  showShuffle?: boolean
  shuffle?: boolean
  onShuffleChange?: (shuffle: boolean) => void
}

export function GroupSelector({
  wordGroups,
  selectedGroup,
  onGroupSelect,
  showShuffle = false,
  shuffle = false,
  onShuffleChange,
}: GroupSelectorProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Select a Group</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {wordGroups?.map(({ group }) => (
            <Button
              key={group}
              variant={selectedGroup === group ? undefined : 'outline'}
              onClick={() => onGroupSelect(group)}
            >
              Group {group}
            </Button>
          ))}
        </div>
        {showShuffle && onShuffleChange && (
          <div className="flex items-center gap-2 mt-2">
            <Switch id="shuffle" checked={shuffle} onCheckedChange={onShuffleChange} />
            <label htmlFor="shuffle" className="text-sm text-gray-700 cursor-pointer select-none">
              Shuffle
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 