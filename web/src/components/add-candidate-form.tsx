'use client'

import { useState, type FormEvent } from 'react'
import { useAction } from '@solana/react'
import { fetchMaybeCandidateAccount, fetchMaybePollAccount, findCandidateAccountPda, findPollAccountPda } from '@/generated'
import {
  Field,
  inputClassName,
  primaryButtonClassName,
  StatusMessage,
} from '@/components/field'
import { VOTING_PROGRAM_ID } from '@/lib/config'
import { parsePollId, validateName } from '@/lib/poll-input'
import { useSendClient } from '@/lib/use-send-client'
import { useWatchedCandidates } from '@/lib/watched-candidates'

export const AddCandidateForm = () => {
  const { client, canSend } = useSendClient()
  const { remember } = useWatchedCandidates()
  const [pollId, setPollId] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { dispatch, isRunning, isError, isSuccess, error, data } = useAction(
    async (signal: AbortSignal) => {
      const parsedPollId = parsePollId(pollId)
      const name = candidateName.trim()
      const nameError = validateName(candidateName, 'candidate name')
      if (parsedPollId == null) throw new Error('Enter a whole number poll id.')
      if (nameError) throw new Error(nameError)

      const [pollAddress] = await findPollAccountPda(
        { pollId: parsedPollId },
        { programAddress: VOTING_PROGRAM_ID },
      )
      const poll = await fetchMaybePollAccount(client.rpc, pollAddress, {
        commitment: 'confirmed',
        abortSignal: signal,
      })
      if (!poll.exists) throw new Error('Create that poll before adding a candidate.')

      const [candidateAddress] = await findCandidateAccountPda(
        { pollId: parsedPollId, candidate: name },
        { programAddress: VOTING_PROGRAM_ID },
      )
      const existing = await fetchMaybeCandidateAccount(client.rpc, candidateAddress, {
        commitment: 'confirmed',
        abortSignal: signal,
      })
      if (existing.exists) throw new Error('That candidate already exists on this poll.')

      const result = await client.voting.instructions
        .initializeCandidate({
          signer: client.payer,
          pollId: parsedPollId,
          candidate: name,
        })
        .sendTransaction({ abortSignal: signal })

      remember(parsedPollId.toString(), name)
      return String(result.context.signature)
    },
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nameError = validateName(candidateName, 'candidate name')
    if (parsePollId(pollId) == null) {
      setFormError('Enter a whole number poll id.')
      return
    }
    if (nameError) {
      setFormError(nameError)
      return
    }
    if (!canSend) {
      setFormError('Connect a wallet before adding a candidate.')
      return
    }
    setFormError(null)
    dispatch()
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Add a candidate</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          The candidate name is part of its address and can be 32 bytes.
        </p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field id="add-candidate-poll-id" label="Poll id">
          <input
            id="add-candidate-poll-id"
            className={inputClassName}
            inputMode="numeric"
            autoComplete="off"
            value={pollId}
            onChange={(event) => setPollId(event.target.value)}
          />
        </Field>
        <Field id="add-candidate-name" label="Candidate name">
          <input
            id="add-candidate-name"
            className={inputClassName}
            maxLength={32}
            value={candidateName}
            onChange={(event) => setCandidateName(event.target.value)}
          />
        </Field>
        <button type="submit" className={primaryButtonClassName} disabled={isRunning || !canSend}>
          {isRunning ? 'Adding…' : 'Add candidate'}
        </button>
        {formError ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {formError}
          </p>
        ) : (
          <StatusMessage error={error} isError={isError} isSuccess={isSuccess} signature={data ?? null} />
        )}
      </form>
    </section>
  )
}
