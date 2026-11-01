'use client'

import { useSyncExternalStore } from 'react'
import { address, formatDecimalFixedPoint, lamportsToSol } from '@solana/kit'
import {
  useConnect,
  useConnectedWallet,
  useDisconnect,
  useWallets,
  WalletReadyGate,
} from '@solana/kit-plugin-wallet/react'
import { primaryButtonClassName, secondaryButtonClassName } from '@/components/field'
import { useBalance } from '@/lib/use-live-account'
import { useSendClient } from '@/lib/use-send-client'
import { clientV0, clientV1 } from '@/lib/solana-client'

const solFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 5 })

const shortenAddress = (value: string) => {
  if (value.length <= 8) return value
  return `${value.slice(0, 4)}…${value.slice(-4)}`
}

const WalletControls = () => {
  const wallets = useWallets(clientV1)
  const connectedV1 = useConnectedWallet(clientV1)
  const { dispatch: connect, isRunning: isConnecting } = useConnect(clientV1)
  const { dispatch: disconnectV1, isRunning: isDisconnecting } = useDisconnect(clientV1)
  const { canSend, needsWalletUpdate, isSwitchingFormat, fallbackError } = useSendClient()
  const accountAddress = connectedV1 ? address(connectedV1.account.address) : undefined
  const { lamports } = useBalance(accountAddress)

  const handleDisconnect = () => {
    disconnectV1()
    void clientV0.wallet.disconnect()
  }

  if (!connectedV1) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Connect a wallet on Solana devnet. The wallet pays rent when it creates a poll or candidate.
        </p>
        {wallets.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No wallet found. Install a Solana wallet that supports Wallet Standard, then refresh.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {wallets.map((wallet) => (
              <button
                key={wallet.name}
                type="button"
                className={primaryButtonClassName}
                disabled={isConnecting}
                aria-label={`Connect ${wallet.name}`}
                onClick={() => connect(wallet)}
              >
                {isConnecting ? 'Connecting…' : `Connect ${wallet.name}`}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const balanceLabel =
    lamports == null ? 'Loading balance…' : `${formatDecimalFixedPoint(solFormatter, lamportsToSol(lamports))} SOL`

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            {shortenAddress(connectedV1.account.address)}
          </span>
          <span className="mx-2 text-zinc-400">·</span>
          <span>{balanceLabel}</span>
          <span className="mx-2 text-zinc-400">·</span>
          <span>Devnet</span>
        </p>
        <button
          type="button"
          className={secondaryButtonClassName}
          disabled={isDisconnecting}
          onClick={handleDisconnect}
        >
          {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
        </button>
      </div>
      {isSwitchingFormat ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Preparing a compatible transaction format for this wallet.
        </p>
      ) : null}
      {needsWalletUpdate ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          Update your wallet to send transactions from this app.
        </p>
      ) : null}
      {fallbackError ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {fallbackError}
        </p>
      ) : null}
      {!canSend && !isSwitchingFormat && !needsWalletUpdate && !fallbackError ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Waiting for the wallet to finish connecting.</p>
      ) : null}
    </div>
  )
}

const subscribeToNothing = () => () => {}

const useHasMounted = () =>
  useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  )

export const WalletBar = () => {
  const hasMounted = useHasMounted()

  if (!hasMounted) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading wallets…</p>
  }

  return (
    <WalletReadyGate client={clientV1} fallback={<p className="text-sm text-zinc-500 dark:text-zinc-400">Loading wallets…</p>}>
      <WalletControls />
    </WalletReadyGate>
  )
}
