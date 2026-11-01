'use client'

import { useMemo } from 'react'
import type { Address, Lamports } from '@solana/kit'
import { useTrackedDataSWR } from '@solana/react/swr'
import { decodeCandidateInfo, decodePollInfo } from '@/lib/decode-account'
import { clientV1 } from '@/lib/solana-client'

const accountConfig = {
  commitment: 'confirmed',
  encoding: 'base64',
} as const

export const useLivePoll = (accountAddress: Address | null) => {
  const spec = useMemo(
    () =>
      accountAddress
        ? {
            initialValueSource: clientV1.rpc.getAccountInfo(accountAddress, accountConfig),
            initialValueMapper: (info: Parameters<typeof decodePollInfo>[1]) =>
              decodePollInfo(accountAddress, info),
            streamSource: clientV1.rpcSubscriptions.accountNotifications(
              accountAddress,
              accountConfig,
            ),
            streamValueMapper: (info: Parameters<typeof decodePollInfo>[1]) =>
              decodePollInfo(accountAddress, info),
          }
        : null,
    [accountAddress],
  )

  const { data, error } = useTrackedDataSWR(
    accountAddress ? ['poll-account', accountAddress] : null,
    spec,
  )

  return {
    poll: data?.value ?? null,
    isLoading: accountAddress != null && data == null && error == null,
    error,
  }
}

export const useLiveCandidate = (accountAddress: Address | null) => {
  const spec = useMemo(
    () =>
      accountAddress
        ? {
            initialValueSource: clientV1.rpc.getAccountInfo(accountAddress, accountConfig),
            initialValueMapper: (info: Parameters<typeof decodeCandidateInfo>[1]) =>
              decodeCandidateInfo(accountAddress, info),
            streamSource: clientV1.rpcSubscriptions.accountNotifications(
              accountAddress,
              accountConfig,
            ),
            streamValueMapper: (info: Parameters<typeof decodeCandidateInfo>[1]) =>
              decodeCandidateInfo(accountAddress, info),
          }
        : null,
    [accountAddress],
  )

  const { data, error } = useTrackedDataSWR(
    accountAddress ? ['candidate-account', accountAddress] : null,
    spec,
  )

  return {
    candidate: data?.value ?? null,
    isLoading: accountAddress != null && data == null && error == null,
    error,
  }
}

export const useBalance = (accountAddress?: Address) => {
  const spec = useMemo(
    () =>
      accountAddress
        ? {
            initialValueSource: clientV1.rpc.getBalance(accountAddress, {
              commitment: 'confirmed',
            }),
            initialValueMapper: (lamports: Lamports) => lamports,
            streamSource: clientV1.rpcSubscriptions.accountNotifications(accountAddress, {
              commitment: 'confirmed',
              encoding: 'base64',
            }),
            streamValueMapper: ({ lamports }: { lamports: Lamports }) => lamports,
          }
        : null,
    [accountAddress],
  )

  const { data, error } = useTrackedDataSWR(
    accountAddress ? ['balance', accountAddress] : null,
    spec,
  )

  return {
    lamports: data?.value ?? null,
    isLoading: accountAddress != null && data == null && error == null,
    error,
  }
}
