import { createClient } from '@solana/kit'
import { solanaDevnetRpc } from '@solana/kit-plugin-rpc'
import { walletSigner } from '@solana/kit-plugin-wallet'
import { votingProgram } from '@/generated'
import { DEVNET_RPC_URL, VOTING_PROGRAM_ID } from '@/lib/config'

const walletConfig = {
  chain: 'solana:devnet',
} as const

export const clientV1 = createClient()
  .use(walletSigner({ ...walletConfig, storageKey: 'voting-wallet-v1' }))
  .use(
    solanaDevnetRpc({
      rpcUrl: DEVNET_RPC_URL,
      transactionConfig: { version: 1 },
    }),
  )
  .use(votingProgram({ programAddress: VOTING_PROGRAM_ID }))

export const clientV0 = createClient()
  .use(walletSigner({ ...walletConfig, storageKey: 'voting-wallet-v0' }))
  .use(
    solanaDevnetRpc({
      rpcUrl: DEVNET_RPC_URL,
      transactionConfig: { version: 0 },
    }),
  )
  .use(votingProgram({ programAddress: VOTING_PROGRAM_ID }))

export type VotingClient = typeof clientV1 | typeof clientV0
