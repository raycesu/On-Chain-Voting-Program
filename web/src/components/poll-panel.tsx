'use client'

import { useEffect, useState, type FormEvent } from 'react'
import type { Address } from '@solana/kit'
import { useAction } from '@solana/react'
import {
  fetchMaybeCandidateAccount,
  fetchMaybePollAccount,
  findCandidateAccountPda,
  findPollAccountPda,
} from '@/generated'
import {
  Field,
  inputClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  StatusMessage,
} from '@/components/field'
import { VOTING_PROGRAM_ID } from '@/lib/config'
import {
  formatUnixSeconds,
  getPollWindow,
  parsePollId,
  validateName,
} from '@/lib/poll-input'
import { useLiveCandidate, useLivePoll } from '@/lib/use-live-account'
import { useCandidateAddress, usePollAddress } from '@/lib/use-pda'
import { useSendClient } from '@/lib/use-send-client'
import { useWatchedCandidates } from '@/lib/watched-candidates'

const windowLabel = {
  before: 'Voting has not started',
  open: 'Voting is open',
  after: 'Voting has ended',
} as const

type CandidateRowProps = {
  pollId: bigint
  name: string
  isVotingOpen: boolean
}

const CandidateRow = ({ pollId, name, isVotingOpen }: CandidateRowProps) => {
  const candidateAddress = useCandidateAddress(pollId, name)
  const { candidate, isLoading } = useLiveCandidate(candidateAddress)
  const { client, canSend } = useSendClient()
  const { dispatch, isRunning, isError, isSuccess, error, data } = useAction(
    async (signal: AbortSignal) => {
      const [pollAddress] = await findPollAccountPda(
        { pollId },
        { programAddress: VOTING_PROGRAM_ID },
      )
      const poll = await fetchMaybePollAccount(client.rpc, pollAddress, {
        commitment: 'confirmed',
        abortSignal: signal,
      })
      if (!poll.exists) throw new Error('That poll does not exist yet.')

      const now = BigInt(Math.floor(Date.now() / 1000))
      if (now <= poll.data.pollVotingStart) throw new Error('Voting period has not started')
      if (now > poll.data.pollVotingEnd) throw new Error('Voting period has ended')

      const [candidatePda] = await findCandidateAccountPda(
        { pollId, candidate: name },
        { programAddress: VOTING_PROGRAM_ID },
      )
      const existing = await fetchMaybeCandidateAccount(client.rpc, candidatePda, {
        commitment: 'confirmed',
        abortSignal: signal,
      })
      if (!existing.exists) throw new Error('That candidate is not on this poll yet.')

      const result = await client.voting.instructions
        .vote({
          signer: client.payer,
          pollId,
          candidate: name,
        })
        .sendTransaction({ abortSignal: signal })

      return String(result.context.signature)
    },
  )

  const canVote = canSend && isVotingOpen && candidate != null && !isRunning

  const handleVote = () => {
    if (!canVote) return
    dispatch()
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {candidateAddress == null || isLoading
              ? 'Loading votes…'
              : candidate
                ? `${candidate.candidateVotes.toString()} votes`
                : 'Not on this poll yet'}
          </p>
        </div>
        <button
          type="button"
          className={primaryButtonClassName}
          disabled={!canVote}
          aria-label={`Vote for ${name}`}
          onClick={handleVote}
        >
          {isRunning ? 'Voting…' : 'Vote'}
        </button>
      </div>
      <StatusMessage error={error} isError={isError} isSuccess={isSuccess} signature={data ?? null} />
    </li>
  )
}

type LoadedPollProps = {
  pollId: bigint
  pollAddress: Address
}

const LoadedPoll = ({ pollId, pollAddress }: LoadedPollProps) => {
  const { poll, isLoading, error } = useLivePoll(pollAddress)
  const { namesFor, remember } = useWatchedCandidates()
  const [candidateName, setCandidateName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [nowSeconds, setNowSeconds] = useState<bigint | null>(null)
  const names = namesFor(pollId.toString())

  useEffect(() => {
    const updateNow = () => setNowSeconds(BigInt(Math.floor(Date.now() / 1000)))
    updateNow()
    const timerId = window.setInterval(updateNow, 1000)
    return () => window.clearInterval(timerId)
  }, [])

  const handleShowCandidate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nameError = validateName(candidateName, 'candidate name')
    if (nameError) {
      setFormError(nameError)
      return
    }
    setFormError(null)
    remember(pollId.toString(), candidateName.trim())
    setCandidateName('')
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading poll…</p>
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-700 dark:text-red-400">
        The poll account could not be read.
      </p>
    )
  }

  if (!poll) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">No poll with that id on devnet.</p>
  }

  const windowState = nowSeconds == null ? null : getPollWindow(poll.pollVotingStart, poll.pollVotingEnd, nowSeconds)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold">{poll.pollName}</h3>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{poll.pollDescription}</p>
        <dl className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex flex-wrap gap-2">
            <dt className="font-medium text-zinc-900 dark:text-zinc-100">Starts</dt>
            <dd>{formatUnixSeconds(poll.pollVotingStart)}</dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="font-medium text-zinc-900 dark:text-zinc-100">Ends</dt>
            <dd>{formatUnixSeconds(poll.pollVotingEnd)}</dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="font-medium text-zinc-900 dark:text-zinc-100">Candidates</dt>
            <dd>{poll.pollOptionIndex.toString()}</dd>
          </div>
        </dl>
        <p className="text-sm font-medium">
          {windowState ? windowLabel[windowState] : 'Checking the voting window…'}
        </p>
        <p className="break-all font-mono text-xs text-zinc-500 dark:text-zinc-400">{pollAddress}</p>
      </div>
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleShowCandidate}>
        <div className="flex-1">
          <Field id="watch-candidate-name" label="Candidate name" hint="Type a name to load that candidate. Names you add are remembered in this browser.">
            <input
              id="watch-candidate-name"
              className={inputClassName}
              maxLength={32}
              value={candidateName}
              aria-describedby="watch-candidate-name-hint"
              onChange={(event) => setCandidateName(event.target.value)}
            />
          </Field>
        </div>
        <button type="submit" className={secondaryButtonClassName}>
          Show candidate
        </button>
      </form>
      {formError ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {formError}
        </p>
      ) : null}
      {names.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No candidates loaded yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {names.map((name) => (
            <CandidateRow
              key={name}
              pollId={pollId}
              name={name}
              isVotingOpen={windowState === 'open'}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export const PollPanel = () => {
  const [pollIdInput, setPollIdInput] = useState('')
  const [activePollId, setActivePollId] = useState<bigint | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const pollAddress = usePollAddress(activePollId)

  const handleLoad = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const pollId = parsePollId(pollIdInput)
    if (pollId == null) {
      setFormError('Enter a whole number poll id.')
      setActivePollId(null)
      return
    }
    setFormError(null)
    setActivePollId(pollId)
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Vote</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Load a poll by id, then vote. The same wallet can vote more than once.
        </p>
      </div>
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleLoad}>
        <div className="flex-1">
          <Field id="load-poll-id" label="Poll id">
            <input
              id="load-poll-id"
              className={inputClassName}
              inputMode="numeric"
              autoComplete="off"
              value={pollIdInput}
              onChange={(event) => setPollIdInput(event.target.value)}
            />
          </Field>
        </div>
        <button type="submit" className={secondaryButtonClassName}>
          Load poll
        </button>
      </form>
      {formError ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {formError}
        </p>
      ) : null}
      {activePollId != null && !pollAddress ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading poll…</p>
      ) : null}
      {activePollId != null && pollAddress ? (
        <LoadedPoll pollId={activePollId} pollAddress={pollAddress} />
      ) : null}
    </section>
  )
}
