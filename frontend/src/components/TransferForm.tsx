import { useState, type FormEvent } from 'react'
import { transfer } from '../services/api'
import type { Account, TransferResult } from '../types/account'

interface TransferFormProps {
  accounts: Account[]
  onTransferred: (result: TransferResult) => void
}

export function TransferForm({ accounts, onTransferred }: TransferFormProps) {
  const [sourceAccountId, setSourceAccountId] = useState('')
  const [destinationAccountId, setDestinationAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedSourceAccountId = sourceAccountId || accounts[0]?.id || ''
  const selectedDestinationAccountId =
    destinationAccountId && destinationAccountId !== selectedSourceAccountId
      ? destinationAccountId
      : accounts.find((account) => account.id !== selectedSourceAccountId)?.id || ''
  const canTransfer = accounts.length >= 2

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await transfer({
        sourceAccountId: selectedSourceAccountId,
        destinationAccountId: selectedDestinationAccountId,
        amount: Number(amount).toFixed(2),
      })

      onTransferred(result)
      setAmount('')
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'Erro ao transferir.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="panel transfer-panel">
      <div className="panel-heading">
        <span className="step">03</span>
        <div>
          <h2>Transferir entre contas</h2>
          <p>Movimente valores com atualização imediata dos dois saldos.</p>
        </div>
      </div>

      <form className="transfer-form" onSubmit={handleSubmit}>
        <label>
          Conta de origem
          <select
            required
            value={selectedSourceAccountId}
            disabled={!canTransfer}
            onChange={(event) => setSourceAccountId(event.target.value)}
          >
            {!canTransfer && <option value="">Crie duas contas primeiro</option>}
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} — {account.type === 'CHECKING' ? 'Corrente' : 'Poupança'}
              </option>
            ))}
          </select>
        </label>

        <label>
          Conta de destino
          <select
            required
            value={selectedDestinationAccountId}
            disabled={!canTransfer}
            onChange={(event) => setDestinationAccountId(event.target.value)}
          >
            {!canTransfer && <option value="">Crie duas contas primeiro</option>}
            {accounts
              .filter((account) => account.id !== selectedSourceAccountId)
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} — {account.type === 'CHECKING' ? 'Corrente' : 'Poupança'}
                </option>
              ))}
          </select>
        </label>

        <label>
          Valor da transferência
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            disabled={!canTransfer}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
          />
        </label>

        {error && <p className="message error transfer-message">{error}</p>}

        <button type="submit" disabled={isSubmitting || !canTransfer}>
          {isSubmitting ? 'Transferindo...' : 'Confirmar transferência'}
        </button>
      </form>
    </section>
  )
}
