import { useState, type FormEvent } from 'react'
import { withdraw } from '../services/api'
import type { Account, WithdrawalResult } from '../types/account'

interface WithdrawalFormProps {
  accounts: Account[]
  onWithdrawn: (result: WithdrawalResult) => void
  onFailed: (accountId: string) => void
}

export function WithdrawalForm({ accounts, onWithdrawn, onFailed }: WithdrawalFormProps) {
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selectedAccountId = accountId || accounts[0]?.id || ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await withdraw(selectedAccountId, Number(amount).toFixed(2))
      onWithdrawn(result)
      setAmount('')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Erro ao sacar.')
      if (selectedAccountId) onFailed(selectedAccountId)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`panel${error ? ' has-error' : ''}`}>
      <div className="panel-heading">
        <span className="step">02</span>
        <div>
          <h2>Fazer um saque</h2>
          <p>Escolha uma conta e informe o valor.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
        <label>
          Conta
          <select
            required
            value={selectedAccountId}
            disabled={accounts.length === 0 || isSubmitting}
            onChange={(event) => setAccountId(event.target.value)}
          >
            {accounts.length === 0 && <option value="">Crie uma conta primeiro</option>}
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} — {account.type === 'CHECKING' ? 'Corrente' : 'Poupança'}
              </option>
            ))}
          </select>
        </label>

        <label>
          Valor do saque
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            disabled={accounts.length === 0 || isSubmitting}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
          />
        </label>

        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={isSubmitting || accounts.length === 0}>
          {isSubmitting ? 'Processando...' : 'Confirmar saque'}
        </button>
      </form>
    </section>
  )
}
