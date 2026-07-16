import type { Account } from '../types/account'

interface AccountListProps {
  accounts: Account[]
  isLoading: boolean
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function AccountList({ accounts, isLoading }: AccountListProps) {
  return (
    <section className="accounts-section">
      <div className="section-title">
        <div>
          <span className="section-number">00 / CONTAS</span>
          <h2>Visão financeira</h2>
        </div>
        <span className="account-count">{String(accounts.length).padStart(2, '0')}</span>
      </div>

      {isLoading ? (
        <p className="empty-state">Carregando contas...</p>
      ) : accounts.length === 0 ? (
        <p className="empty-state">Nenhuma conta cadastrada. Crie a primeira ao lado.</p>
      ) : (
        <div className="account-ledger">
          {accounts.map((account, index) => (
            <article className="account-row" key={account.id}>
              <span className="account-index">{String(index + 1).padStart(2, '0')}</span>
              <div className="account-identity">
                <h3>{account.name}</h3>
                <p>
                  {account.type === 'CHECKING' ? 'Conta corrente' : 'Conta poupança'}
                  <span> / final {account.id.slice(-4)}</span>
                </p>
              </div>
              <div className="balance-block">
                <span>Saldo disponível</span>
                <strong>
                {currencyFormatter.format(Number(account.balance))}
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
