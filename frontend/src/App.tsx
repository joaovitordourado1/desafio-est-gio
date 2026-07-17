import { useEffect, useState } from 'react'
import { AccountForm } from './components/AccountForm'
import { AccountList } from './components/AccountList'
import { TransferForm } from './components/TransferForm'
import { WithdrawalForm } from './components/WithdrawalForm'
import { listAccounts } from './services/api'
import type { Account, TransferResult, WithdrawalResult } from './types/account'
import './App.css'

interface AccountFeedback {
  accountIds: string[]
  type: 'success' | 'error'
}

function App() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [accountFeedback, setAccountFeedback] = useState<AccountFeedback | null>(null)
  const [reloadAttempt, setReloadAttempt] = useState(0)

  useEffect(() => {
    let isActive = true

    listAccounts()
      .then((loadedAccounts) => {
        if (isActive) setAccounts(loadedAccounts)
      })
      .catch((caughtError: unknown) => {
        if (isActive) {
          setError(
            caughtError instanceof Error ? caughtError.message : 'Erro ao carregar contas.',
          )
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [reloadAttempt])

  useEffect(() => {
    if (!notice) return

    const timeoutId = window.setTimeout(() => setNotice(null), 4_500)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  useEffect(() => {
    if (!accountFeedback) return

    const timeoutId = window.setTimeout(() => setAccountFeedback(null), 2_400)
    return () => window.clearTimeout(timeoutId)
  }, [accountFeedback])

  function showAccountFeedback(accountIds: string[], type: AccountFeedback['type']) {
    if (type === 'error') setNotice(null)
    setAccountFeedback({ accountIds, type })
  }

  function retryAccountLoading() {
    setError(null)
    setIsLoading(true)
    setReloadAttempt((currentAttempt) => currentAttempt + 1)
  }

  function handleCreated(account: Account) {
    setAccounts((currentAccounts) => [account, ...currentAccounts])
    setNotice(`Conta “${account.name}” criada com sucesso.`)
    setError(null)
    showAccountFeedback([account.id], 'success')
  }

  function handleWithdrawn(result: WithdrawalResult) {
    setAccounts((currentAccounts) =>
      currentAccounts.map((account) =>
        account.id === result.account.id ? result.account : account,
      ),
    )
    setNotice(`Saque de R$ ${result.amount} realizado. Tarifa: R$ ${result.fee}.`)
    setError(null)
    showAccountFeedback([result.account.id], 'success')
  }

  function handleTransferred(result: TransferResult) {
    setAccounts((currentAccounts) =>
      currentAccounts.map((account) => {
        if (account.id === result.sourceAccount.id) return result.sourceAccount
        if (account.id === result.destinationAccount.id) return result.destinationAccount
        return account
      }),
    )
    setNotice(
      `Transferência de R$ ${result.amount} realizada. Tarifa: R$ ${result.fee}.`,
    )
    setError(null)
    showAccountFeedback(
      [result.sourceAccount.id, result.destinationAccount.id],
      'success',
    )
  }

  const connectionLabel = isLoading
    ? 'Conectando'
    : error
      ? 'Conexão indisponível'
      : 'Conexão ativa'

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Banco Agilize — início">
          AGILIZE<span>/bank</span>
        </a>
        <div className="topbar-meta">
          <span>{connectionLabel}</span>
          <span
            className={`status-dot ${error ? 'is-error' : ''}`}
            role="status"
            aria-label={connectionLabel}
          />
        </div>
      </header>

      <main className="workspace" id="top">
        <aside className="intro-column">
          <p className="edition">Painel financeiro · 2026</p>
          <h1>
            Visão geral
            <em>das suas contas.</em>
          </h1>
          <p className="intro-text">
            Acompanhe saldos e movimente suas contas em um só lugar, com clareza em
            cada operação.
          </p>

          <div className="rules-note">
            <p>
              <strong>Corrente</strong>
              <span>R$ 1 por operação · limite de −R$ 500</span>
            </p>
            <p>
              <strong>Poupança</strong>
              <span>Sem tarifa · saldo nunca negativo</span>
            </p>
          </div>
        </aside>

        <section className="dashboard-column">
          {(notice || error) && (
            <div
              className={`global-message ${error ? 'error' : 'success'}`}
              role={error ? 'alert' : 'status'}
            >
              <span className="message-icon" aria-hidden="true">
                {error ? '!' : '✓'}
              </span>
              <span>{error ?? notice}</span>
              {error && (
                <button
                  className="message-action"
                  type="button"
                  onClick={retryAccountLoading}
                >
                  Tentar novamente
                </button>
              )}
            </div>
          )}

          <AccountList
            accounts={accounts}
            isLoading={isLoading}
            successAccountIds={
              accountFeedback?.type === 'success' ? accountFeedback.accountIds : []
            }
            errorAccountIds={
              accountFeedback?.type === 'error' ? accountFeedback.accountIds : []
            }
          />

          <div className="operations-grid">
            <AccountForm onCreated={handleCreated} onFailed={() => setNotice(null)} />
            <WithdrawalForm
              accounts={accounts}
              onWithdrawn={handleWithdrawn}
              onFailed={(accountId) => showAccountFeedback([accountId], 'error')}
            />
            <TransferForm
              accounts={accounts}
              onTransferred={handleTransferred}
              onFailed={(accountIds) => showAccountFeedback(accountIds, 'error')}
            />
          </div>
        </section>
      </main>

      <footer>
        <span>AGILIZE/BANK</span>
        <span>{connectionLabel} · PostgreSQL</span>
        <span>Desafio técnico 2026</span>
      </footer>
    </div>
  )
}

export default App
