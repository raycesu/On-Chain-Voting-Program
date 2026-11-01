import { getBase64Encoder, type Address, type Lamports } from '@solana/kit'
import {
  decodeCandidateAccount,
  decodePollAccount,
  type CandidateAccount,
  type PollAccount,
} from '@/generated'

type RawAccountInfo = {
  data: Uint8Array | readonly [string, string]
  executable: boolean
  lamports: Lamports
  owner: Address
  space: bigint | number
} | null

const readAccountBytes = (
  data: NonNullable<RawAccountInfo>['data'],
) => {
  if (data instanceof Uint8Array) return data
  const [encoded] = data
  if (typeof encoded !== 'string') return null
  return getBase64Encoder().encode(encoded)
}

const toEncodedAccount = (
  accountAddress: Address,
  info: NonNullable<RawAccountInfo>,
) => {
  const data = readAccountBytes(info.data)
  if (!data) return null
  const space = typeof info.space === 'bigint' ? info.space : BigInt(info.space)
  return {
    address: accountAddress,
    data,
    executable: info.executable,
    lamports: info.lamports,
    programAddress: info.owner,
    space,
  }
}

export const decodePollInfo = (
  accountAddress: Address,
  info: RawAccountInfo,
): PollAccount | null => {
  if (!info) return null
  const encoded = toEncodedAccount(accountAddress, info)
  if (!encoded) return null
  return decodePollAccount(encoded).data
}

export const decodeCandidateInfo = (
  accountAddress: Address,
  info: RawAccountInfo,
): CandidateAccount | null => {
  if (!info) return null
  const encoded = toEncodedAccount(accountAddress, info)
  if (!encoded) return null
  return decodeCandidateAccount(encoded).data
}
