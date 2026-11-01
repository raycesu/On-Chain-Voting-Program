'use client'

import { useState, type FormEvent } from 'react'
import { useAction } from '@solana/react'
import { fetchMaybePollAccount, findPollAccountPda } from '@/generated'
import {
  Field,
  inputClassName,
  primaryButtonClassName,
  StatusMessage,
} from '@/components/field'
import { VOTING_PROGRAM_ID } from '@/lib/config'
import {
  parsePollId,
  parseUnixSeconds,
  validateDescription,
  validateName,
} from '@/lib/poll-input'
import { useSendClient } from '@/lib/use-send-client'

export const CreatePollForm = () => {
  const { client, canSend } = useSendClient()
  const [pollId, setPollId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { dispatch, isRunning, isError, isSuccess, error, data } = useAction(
    async (signal: AbortSignal) => {
      const parsedPollId = parsePollId(pollId)
      const pollName = name.trim()
      const pollDescription = description.trim()
      const startSeconds = parseUnixSeconds(start)
      const endSeconds = parseUnixSeconds(end)
      const nameError = validateName(name, 'name')
      const descriptionError = validateDescription(description)
      if (parsedPollId == null) throw new Error('Enter a whole number poll id.')
      if (nameError) throw new Error(nameError)
      if (descriptionError) throw new Error(descriptionError)
      if (startSeconds == null || endSeconds == null) throw new Error('Choose a start and end time.')
      if (endSeconds <= startSeconds) throw new Error('The end time must be after the start time.')

      const [pollAddress] = await findPollAccountPda(
        { pollId: parsedPollId },
        { programAddress: VOTING_PROGRAM_ID },
      )
      const existing = await fetchMaybePollAccount(client.rpc, pollAddress, {
        commitment: 'confirmed',
        abortSignal: signal,
      })
      if (existing.exists) throw new Error('A poll with that id already exists.')

      const result = await client.voting.instructions
        .initPoll({
          signer: client.payer,
          pollId: parsedPollId,
          start: startSeconds,
          end: endSeconds,
          name: pollName,
          description: pollDescription,
        })
        .sendTransaction({ abortSignal: signal })

      return String(result.context.signature)
    },
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nameError = validateName(name, 'name')
    const descriptionError = validateDescription(description)
    const startSeconds = parseUnixSeconds(start)
    const endSeconds = parseUnixSeconds(end)

    if (parsePollId(pollId) == null) {
      setFormError('Enter a whole number poll id.')
      return
    }
    if (nameError) {
      setFormError(nameError)
      return
    }
    if (descriptionError) {
      setFormError(descriptionError)
      return
    }
    if (startSeconds == null || endSeconds == null) {
      setFormError('Choose a start and end time.')
      return
    }
    if (endSeconds <= startSeconds) {
      setFormError('The end time must be after the start time.')
      return
    }
    if (!canSend) {
      setFormError('Connect a wallet before creating a poll.')
      return
    }

    setFormError(null)
    dispatch()
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Create a poll</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Names can be 32 bytes. Descriptions can be 280 bytes. Voting opens after the start time and stays open through the end time.
        </p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field id="create-poll-id" label="Poll id" hint="Any whole number. It becomes part of the poll address.">
          <input
            id="create-poll-id"
            className={inputClassName}
            inputMode="numeric"
            autoComplete="off"
            value={pollId}
            aria-describedby="create-poll-id-hint"
            onChange={(event) => setPollId(event.target.value)}
          />
        </Field>
        <Field id="create-poll-name" label="Name">
          <input
            id="create-poll-name"
            className={inputClassName}
            maxLength={32}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field id="create-poll-description" label="Description">
          <textarea
            id="create-poll-description"
            className={`${inputClassName} h-28 py-2`}
            maxLength={280}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="create-poll-start" label="Voting starts">
            <input
              id="create-poll-start"
              className={inputClassName}
              type="datetime-local"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </Field>
          <Field id="create-poll-end" label="Voting ends">
            <input
              id="create-poll-end"
              className={inputClassName}
              type="datetime-local"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </Field>
        </div>
        <button type="submit" className={primaryButtonClassName} disabled={isRunning || !canSend}>
          {isRunning ? 'Creating…' : 'Create poll'}
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
