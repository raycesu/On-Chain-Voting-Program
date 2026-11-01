'use client'

import { useEffect, useState } from 'react'
import type { Address } from '@solana/kit'
import { findCandidateAccountPda, findPollAccountPda } from '@/generated'
import { VOTING_PROGRAM_ID } from '@/lib/config'

export const usePollAddress = (pollId: bigint | null) => {
  const [trackedPollId, setTrackedPollId] = useState(pollId)
  const [pollAddress, setPollAddress] = useState<Address | null>(null)

  if (trackedPollId !== pollId) {
    setTrackedPollId(pollId)
    setPollAddress(null)
  }

  useEffect(() => {
    if (pollId == null) return

    let isCancelled = false
    void findPollAccountPda({ pollId }, { programAddress: VOTING_PROGRAM_ID }).then(([pda]) => {
      if (!isCancelled) setPollAddress(pda)
    })

    return () => {
      isCancelled = true
    }
  }, [pollId])

  return pollAddress
}

export const useCandidateAddress = (pollId: bigint | null, candidateName: string | null) => {
  const requestKey =
    pollId == null || !candidateName ? null : `${pollId.toString()}:${candidateName}`
  const [trackedKey, setTrackedKey] = useState(requestKey)
  const [candidateAddress, setCandidateAddress] = useState<Address | null>(null)

  if (trackedKey !== requestKey) {
    setTrackedKey(requestKey)
    setCandidateAddress(null)
  }

  useEffect(() => {
    if (pollId == null || !candidateName) return

    let isCancelled = false
    void findCandidateAccountPda(
      { pollId, candidate: candidateName },
      { programAddress: VOTING_PROGRAM_ID },
    ).then(([pda]) => {
      if (!isCancelled) setCandidateAddress(pda)
    })

    return () => {
      isCancelled = true
    }
  }, [candidateName, pollId])

  return candidateAddress
}
