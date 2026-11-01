'use client'

import { AddCandidateForm } from '@/components/add-candidate-form'
import { CreatePollForm } from '@/components/create-poll-form'
import { PollPanel } from '@/components/poll-panel'
import { WalletBar } from '@/components/wallet-bar'
import { WatchedCandidatesProvider } from '@/lib/watched-candidates'

export const VotingApp = () => {
  return (
    <WatchedCandidatesProvider>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Solana devnet</p>
            <h1 className="text-3xl font-semibold tracking-tight">On-chain voting</h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Create a poll, add candidates, and vote with the program already deployed on devnet.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <WalletBar />
          </div>
        </header>
        <CreatePollForm />
        <AddCandidateForm />
        <PollPanel />
      </div>
    </WatchedCandidatesProvider>
  )
}
