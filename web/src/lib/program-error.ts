import {
  isSolanaError,
  SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND,
  SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_ALREADY_INITIALIZED,
  SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
  SOLANA_ERROR__INSTRUCTION_ERROR__INSUFFICIENT_FUNDS,
  SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_FEE,
  SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_RENT,
} from '@solana/kit'
import {
  VOTING_ERROR__VOTING_ENDED,
  VOTING_ERROR__VOTING_PERIOD_NOT_STARTED,
} from '@/generated'

const votingMessages: Record<number, string> = {
  [VOTING_ERROR__VOTING_ENDED]: 'Voting period has ended',
  [VOTING_ERROR__VOTING_PERIOD_NOT_STARTED]: 'Voting period has not started',
}

const formatOne = (error: unknown): string | null => {
  if (isSolanaError(error, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM)) {
    const code = Number(error.context.code)
    return votingMessages[code] ?? `The program rejected the transaction (${code}).`
  }
  if (isSolanaError(error, SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_ALREADY_INITIALIZED)) {
    return 'That account already exists.'
  }
  if (
    isSolanaError(error, SOLANA_ERROR__INSTRUCTION_ERROR__INSUFFICIENT_FUNDS) ||
    isSolanaError(error, SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_FEE) ||
    isSolanaError(error, SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_RENT)
  ) {
    return 'The wallet does not have enough devnet SOL for rent and fees.'
  }
  if (isSolanaError(error, SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND)) {
    return 'That account was not found on devnet.'
  }
  if (error instanceof Error && /reject/i.test(error.message)) {
    return 'The wallet rejected the transaction.'
  }
  return null
}

export const formatTransactionError = (error: unknown): string => {
  const direct = formatOne(error)
  if (direct) return direct
  if (error instanceof Error && error.cause) {
    const caused = formatOne(error.cause)
    if (caused) return caused
  }
  if (error instanceof Error && error.message) return error.message
  return 'The transaction failed.'
}
