'use client'

import { useEffect, useState } from 'react'
import { useConnectedWallet } from '@solana/kit-plugin-wallet/react'
import { formatTransactionError } from '@/lib/program-error'
import { clientV0, clientV1 } from '@/lib/solana-client'

export const useSendClient = () => {
  const connectedV1 = useConnectedWallet(clientV1)
  const connectedV0 = useConnectedWallet(clientV0)
  const [fallbackError, setFallbackError] = useState<string | null>(null)
  const supportsV1 = connectedV1?.supportedTransactionVersions.has(1) ?? false
  const supportsV0 = connectedV0?.supportedTransactionVersions.has(0) ?? false

  useEffect(() => {
    if (!connectedV1 || supportsV1 || connectedV0) return
    let isCancelled = false
    void clientV0.wallet.connect(connectedV1.wallet).catch((error: unknown) => {
      if (!isCancelled) setFallbackError(formatTransactionError(error))
    })
    return () => {
      isCancelled = true
    }
  }, [connectedV0, connectedV1, supportsV1])

  if (supportsV1 && connectedV1) {
    return {
      client: clientV1,
      connected: connectedV1,
      canSend: true,
      needsWalletUpdate: false,
      isSwitchingFormat: false,
      fallbackError: null,
    }
  }

  if (connectedV1 && supportsV0 && connectedV0) {
    return {
      client: clientV0,
      connected: connectedV0,
      canSend: true,
      needsWalletUpdate: false,
      isSwitchingFormat: false,
      fallbackError: null,
    }
  }

  const needsWalletUpdate = Boolean(connectedV1 && !supportsV1 && connectedV0 && !supportsV0)
  const isSwitchingFormat = Boolean(connectedV1 && !supportsV1 && !connectedV0 && !fallbackError)

  return {
    client: supportsV1 ? clientV1 : clientV0,
    connected: supportsV1 ? connectedV1 : null,
    canSend: false,
    needsWalletUpdate,
    isSwitchingFormat,
    fallbackError,
  }
}
