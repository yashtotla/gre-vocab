import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WordCardProps {
  word: {
    word: string
    slug: string
    group: number
    definitions: Array<{
      part_of_speech: string
      definition: string
      example: string | null
      synonyms: Array<string>
    }>
  }
  highlightMatches?: {
    wordMatch?: Array<[number, number]>
    defMatches?: Record<number, Array<[number, number]>>
    exampleMatches?: Record<number, Array<[number, number]>>
    synonymMatches?: Record<string, Array<[number, number]> | undefined>
  }
  search?: string
  className?: string
}

function highlight(text: string, matches?: ReadonlyArray<[number, number]>) {
  const safeMatches = matches ?? [];
  if (!safeMatches.length) return text;
  let result = '';
  let lastIndex = 0;
  safeMatches.forEach(([start, end]) => {
    result += text.slice(lastIndex, start);
    result += `<mark class="bg-yellow-200">${text.slice(start, end + 1)}</mark>`;
    lastIndex = end + 1;
  });
  result += text.slice(lastIndex);
  return result;
}

export function WordCard({ word, highlightMatches, search, className }: WordCardProps) {
  const wordMatch = highlightMatches?.wordMatch ?? [];
  const defMatches = highlightMatches?.defMatches ?? {};
  const exampleMatches = highlightMatches?.exampleMatches ?? {};
  const synonymMatches = highlightMatches?.synonymMatches ?? {};

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          <span
            className="font-semibold"
            dangerouslySetInnerHTML={{ __html: highlight(word.word, wordMatch) }}
          />
          <span className="ml-2 text-xs text-gray-500">(Group {word.group})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {word.definitions.map((def, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-sm text-gray-500">{def.part_of_speech}</p>
              <p
                dangerouslySetInnerHTML={{ __html: highlight(def.definition, defMatches[idx]) }}
              />
              {def.example && (
                <p
                  className="text-sm italic text-gray-500"
                  dangerouslySetInnerHTML={{ __html: highlight(def.example, exampleMatches[idx]) }}
                />
              )}
              {def.synonyms.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Synonyms:</p>
                  <div className="flex flex-wrap gap-2">
                    {def.synonyms.map(synonym => {
                      const matchKey = `${idx}-${synonym}`;
                      const matchIndices = synonymMatches[matchKey];
                      let display = highlight(synonym, matchIndices);
                      if (
                        (!matchIndices || matchIndices.length === 0) &&
                        search?.trim() &&
                        synonym.toLowerCase().includes(search.trim().toLowerCase())
                      ) {
                        const q = search.trim().toLowerCase();
                        const start = synonym.toLowerCase().indexOf(q);
                        const end = start + q.length - 1;
                        display = highlight(synonym, [[start, end]]);
                      }
                      return (
                        <span
                          key={synonym}
                          className="inline-block text-xs bg-gray-100 rounded px-2 py-1 text-gray-700"
                          dangerouslySetInnerHTML={{ __html: display }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 