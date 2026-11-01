import type { ReactNode } from 'react'
import { formatTransactionError } from '@/lib/program-error'

export const inputClassName =
  'h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:border-zinc-100 dark:focus-visible:ring-zinc-100'

export const primaryButtonClassName =
  'inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'

export const secondaryButtonClassName =
  'inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900'

type FieldProps = {
  id: string
  label: string
  hint?: string
  children: ReactNode
}

export const Field = ({ id, label, hint, children }: FieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

type StatusMessageProps = {
  error: unknown
  isError: boolean
  isSuccess: boolean
  signature: string | null
}

export const StatusMessage = ({ error, isError, isSuccess, signature }: StatusMessageProps) => {
  if (isError) {
    return (
      <p role="alert" className="text-sm text-red-700 dark:text-red-400">
        {formatTransactionError(error)}
      </p>
    )
  }

  if (!isSuccess || !signature) return null

  return (
    <p className="text-sm text-zinc-700 dark:text-zinc-300">
      Confirmed.{' '}
      <a
        href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
        target="_blank"
        rel="noreferrer"
        className="font-medium underline"
      >
        View transaction
      </a>
    </p>
  )
}
