'use client'

import type { ReactNode } from 'react'
import { ClientProvider } from '@solana/react'
import { clientV1 } from '@/lib/solana-client'

type ProvidersProps = {
  children: ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  return <ClientProvider client={clientV1}>{children}</ClientProvider>
}
