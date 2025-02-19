export const state = $state({
  translations: [] as Translation[],
  keywordDatabase: {} as Record<string, { from: string, to: string }[]>,
  openaiKey: '',
  current: {
    translating: new Set<string>(),
    searching: new Set<string>(),
  }
})

type TranslateLine = {
  time: string;
  content: string
  translation?: string
}

export type Translation = {
  id: string
  name: string
  keywordDB: string
  pendingKeywords: { from: string, to: string }[]
  keywords: { from: string, to: string }[]
  language: string
  targetLanguage: string
  translateLines: TranslateLine[]
}