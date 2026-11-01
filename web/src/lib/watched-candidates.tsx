'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'onchain-voting.watched-candidates'
const CHANGE_EVENT = 'voting-watch-change'

type WatchLists = Record<string, string[]>

type WatchedCandidatesContextValue = {
  namesFor: (pollId: string) => string[]
  remember: (pollId: string, name: string) => void
}

const WatchedCandidatesContext = createContext<WatchedCandidatesContextValue | null>(null)

const parseLists = (raw: string): WatchLists => {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const lists: WatchLists = {}
    for (const [pollId, names] of Object.entries(parsed)) {
      if (!Array.isArray(names)) continue
      lists[pollId] = names.filter((name): name is string => typeof name === 'string')
    }
    return lists
  } catch {
    return {}
  }
}

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(CHANGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(CHANGE_EVENT, onStoreChange)
  }
}

const getSnapshot = () => window.localStorage.getItem(STORAGE_KEY) ?? ''

const getServerSnapshot = () => ''

const rememberCandidate = (pollId: string, name: string) => {
  const lists = parseLists(window.localStorage.getItem(STORAGE_KEY) ?? '')
  const existing = lists[pollId] ?? []
  if (existing.includes(name)) return
  const next = { ...lists, [pollId]: [...existing, name] }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export const WatchedCandidatesProvider = ({ children }: { children: ReactNode }) => {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const lists = useMemo(() => parseLists(raw), [raw])
  const namesFor = useCallback((pollId: string) => lists[pollId] ?? [], [lists])
  const remember = useCallback((pollId: string, name: string) => {
    rememberCandidate(pollId, name)
  }, [])
  const value = useMemo(() => ({ namesFor, remember }), [namesFor, remember])

  return (
    <WatchedCandidatesContext.Provider value={value}>{children}</WatchedCandidatesContext.Provider>
  )
}

export const useWatchedCandidates = () => {
  const value = useContext(WatchedCandidatesContext)
  if (!value) {
    throw new Error('useWatchedCandidates must be used within WatchedCandidatesProvider')
  }
  return value
}
