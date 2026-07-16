import { useEffect, useState } from 'react'
import { AccountForm } from './components/AccountForm'
import { AccountList } from './components/AccountList'
import { TransferForm } from './components/TransferForm'
import { WithdrawalForm } from './components/WithdrawalForm'
import { listAccounts } from './services/api'
import type { Account, TransferResult, WithdrawalResult } from './types/account'
import './App.css'

function App() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

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
  }, [])

  function handleCreated(account: Account) {
    setAccounts((currentAccounts) => [account, ...currentAccounts])
    setNotice(`Conta “${account.name}” criada com sucesso.`)
    setError(null)
  }

  function handleWithdrawn(result: WithdrawalResult) {
    setAccounts((currentAccounts) =>
      currentAccounts.map((account) =>
        account.id === result.account.id ? result.account : account,
      ),
    )
    setNotice(`Saque de R$ ${result.amount} realizado. Tarifa: R$ ${result.fee}.`)
    setError(null)
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
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Banco Agilize — início">
          AGILIZE<span>/bank</span>
        </a>
        <div className="topbar-meta">
          <span>Ambiente seguro</span>
          <span className="status-dot" aria-label="Sistema disponível" />
        </div>
      </header>

      <main className="workspace" id="top">
        <aside className="intro-column">
          <p className="edition">Conta digital — edição 2026</p>
          <h1>
            Seu dinheiro,
            <em>sem rodeios.</em>
          </h1>
          <p className="intro-text">
            Uma visão direta das suas contas. Crie, consulte e movimente sem sair da página.
          </p>

          <div className="rules-note">
            <p><strong>Corrente</strong><span>R$ 1 por operação · limite de −R$ 500</span></p>
            <p><strong>Poupança</strong><span>Sem tarifa · saldo nunca negativo</span></p>
          </div>
        </aside>

        <section className="dashboard-column">
          {(notice || error) && (
            <div className={`global-message ${error ? 'error' : 'success'}`} role="status">
              {error ?? notice}
            </div>
          )}

          <AccountList accounts={accounts} isLoading={isLoading} />

          <div className="operations-grid">
            <AccountForm onCreated={handleCreated} />
            <WithdrawalForm accounts={accounts} onWithdrawn={handleWithdrawn} />
            <TransferForm accounts={accounts} onTransferred={handleTransferred} />
          </div>
        </section>
      </main>

      <footer>
        <span>AGILIZE/BANK</span>
        <span>API conectada · PostgreSQL</span>
        <span>Desafio técnico 2026</span>
      </footer>
    </div>
  )
}

export default App
