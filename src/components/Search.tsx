import { useEffect, useRef, useState } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import Fuse from 'fuse.js'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { WordCard } from './words/WordCard'
import { useDebounce } from '@/hooks/useDebounce'
import { useWordGroups } from '@/hooks/useWordGroups'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetClose,
} from './ui/sheet'

export function Search() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  const { allWords } = useWordGroups()

  // Fuse.js setup
  const fuse = new Fuse(allWords, {
    keys: [
      'word',
      'definitions.definition',
      'definitions.example',
      'definitions.synonyms',
    ],
    includeMatches: true,
    threshold: 0.4,
    minMatchCharLength: 2,
    ignoreLocation: true,
  })

  // Search results
  const searchResults = debouncedSearch.trim()
    ? fuse.search(debouncedSearch.trim())
    : []

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 0)
      } else if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => {
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 0)
          }}
        >
          <SearchIcon className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 max-w-full w-full sm:w-96 flex flex-col">
        <SheetHeader className="border-b p-4 flex flex-row items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Search words, definitions, or examples..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
          />
          <SheetClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="text-center">
                {search.trim() ? (
                  'No results found.'
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span>Press</span>
                    <kbd className="px-2 py-1 text-sm bg-gray-100 rounded border border-gray-200">
                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + K
                    </kbd>
                    <span>to search</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {searchResults.length > 10 && (
                <div className="text-xs text-gray-400 mb-2">
                  Showing top 10 of {searchResults.length} results
                </div>
              )}
              <div className="space-y-4">
                {searchResults.slice(0, 10).map(result => {
                  const word = result.item
                  let wordMatch: Array<[number, number]> = []
                  const defMatches: Record<number, Array<[number, number]>> = {}
                  const exampleMatches: Record<number, Array<[number, number]>> = {}
                  const synonymMatches: Record<string, Array<[number, number]> | undefined> = {}
                  if (result.matches) {
                    for (const m of result.matches) {
                      if (m.key === 'word') wordMatch = m.indices as Array<[number, number]>
                      if (m.key === 'definitions.definition' && typeof m.refIndex === 'number') {
                        defMatches[m.refIndex] = m.indices as Array<[number, number]>
                      }
                      if (m.key === 'definitions.example' && typeof m.refIndex === 'number') {
                        exampleMatches[m.refIndex] = m.indices as Array<[number, number]>
                      }
                      if (m.key === 'definitions.synonyms' && typeof m.refIndex === 'number' && typeof m.value === 'string') {
                        synonymMatches[`${m.refIndex}-${m.value}`] = m.indices as Array<[number, number]>
                      }
                    }
                  }
                  return (
                    <WordCard
                      key={word.slug}
                      word={word}
                      highlightMatches={{ wordMatch, defMatches, exampleMatches, synonymMatches }}
                      search={search}
                    />
                  )
                })}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
