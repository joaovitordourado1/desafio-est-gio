import type { Account } from '../types/account'

interface AccountListProps {
  accounts: Account[]
  isLoading: boolean
  successAccountIds: string[]
  errorAccountIds: string[]
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function AccountList({
  accounts,
  isLoading,
  successAccountIds,
  errorAccountIds,
}: AccountListProps) {
  return (
    <section className="accounts-section" aria-busy={isLoading}>
      <div className="section-title">
        <div>
          <span className="section-number">00 / CONTAS</span>
          <h2>Suas contas</h2>
        </div>
        <span className="account-count">{String(accounts.length).padStart(2, '0')}</span>
      </div>

      {isLoading ? (
        <div
          className="account-ledger skeleton-list"
          role="status"
          aria-label="Carregando contas"
        >
          {[0, 1].map((item) => (
            <article className="account-card skeleton-card" key={item} aria-hidden="true">
              <span className="skeleton skeleton-index" />
              <div className="skeleton-copy">
                <span className="skeleton skeleton-title" />
                <span className="skeleton skeleton-meta" />
              </div>
              <div className="skeleton-balance">
                <span className="skeleton skeleton-label" />
                <span className="skeleton skeleton-value" />
              </div>
            </article>
          ))}
          <span className="sr-only">Carregando contas...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="empty-state">
          <span>00</span>
          <p>Nenhuma conta cadastrada. Crie a primeira para começar.</p>
        </div>
      ) : (
        <div className="account-ledger">
          {accounts.map((account, index) => {
            const hasInvalidSavingsBalance =
              account.type === 'SAVINGS' && Number(account.balance) < 0
            const hasOperationError = errorAccountIds.includes(account.id)
            const hasError = hasInvalidSavingsBalance || hasOperationError
            const isSuccessful = successAccountIds.includes(account.id) && !hasError

            return (
              <article
                className={`account-card${isSuccessful ? ' is-success' : ''}${hasError ? ' is-error' : ''}`}
                key={account.id}
              >
                <span className="account-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="account-identity">
                  <h3>{account.name}</h3>
                  <p>
                    <span>
                      {account.type === 'CHECKING' ? 'Conta corrente' : 'Conta poupança'}
                    </span>
                    <span className="account-id">
                      Final {account.id.slice(-4).toUpperCase()}
                    </span>
                  </p>
                  {hasError && (
                    <span className="account-warning" role="status">
                      <span aria-hidden="true">!</span>
                      {hasInvalidSavingsBalance
                        ? 'Saldo incompatível com conta poupança'
                        : 'Operação não concluída'}
                    </span>
                  )}
                </div>
                <div className="balance-block">
                  <span>Saldo disponível</span>
                  <strong>{currencyFormatter.format(Number(account.balance))}</strong>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
