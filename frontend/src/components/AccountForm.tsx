import { useState, type FormEvent } from 'react'
import { createAccount } from '../services/api'
import type { Account, AccountType } from '../types/account'

interface AccountFormProps {
  onCreated: (account: Account) => void
  onFailed: () => void
}

export function AccountForm({ onCreated, onFailed }: AccountFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('CHECKING')
  const [initialBalance, setInitialBalance] = useState('0.00')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const account = await createAccount({
        name,
        type,
        initialBalance: Number(initialBalance).toFixed(2),
      })

      onCreated(account)
      setName('')
      setInitialBalance('0.00')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Erro ao criar conta.')
      onFailed()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`panel${error ? ' has-error' : ''}`}>
      <div className="panel-heading">
        <span className="step">01</span>
        <div>
          <h2>Criar conta</h2>
          <p>Cadastre uma conta corrente ou poupança.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
        <label>
          Nome da conta
          <input
            required
            minLength={2}
            maxLength={100}
            value={name}
            disabled={isSubmitting}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Conta principal"
          />
        </label>

        <label>
          Tipo
          <select
            value={type}
            disabled={isSubmitting}
            onChange={(event) => setType(event.target.value as AccountType)}
          >
            <option value="CHECKING">Conta corrente</option>
            <option value="SAVINGS">Conta poupança</option>
          </select>
        </label>

        <label>
          Saldo inicial
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={initialBalance}
            disabled={isSubmitting}
            onChange={(event) => setInitialBalance(event.target.value)}
          />
        </label>

        {error && <p className="message error" role="alert">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
    </section>
  )
}
