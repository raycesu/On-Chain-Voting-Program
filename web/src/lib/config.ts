import { address, type Address } from '@solana/kit'

const DEFAULT_RPC_URL = 'https://api.devnet.solana.com'
const DEFAULT_PROGRAM_ID = 'hdeJLJzveZvk935dRPPfa6kAbtZfE9hji5b2JnuRHX8'

export const DEVNET_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? DEFAULT_RPC_URL

export const VOTING_PROGRAM_ID: Address = address(
  process.env.NEXT_PUBLIC_VOTING_PROGRAM_ID ?? DEFAULT_PROGRAM_ID,
)

export const MAX_NAME_BYTES = 32
export const MAX_DESCRIPTION_BYTES = 280
