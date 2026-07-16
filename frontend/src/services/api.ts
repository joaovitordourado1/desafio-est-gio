import type {
  Account,
  CreateAccountInput,
  WithdrawalResult,
} from '../types/account'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface ErrorResponse {
  error?: {
    message?: string
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const body = (await response.json().catch(() => null)) as T | ErrorResponse | null

  if (!response.ok) {
    const errorBody = body as ErrorResponse | null
    throw new Error(errorBody?.error?.message ?? 'Não foi possível concluir a operação.')
  }

  return body as T
}

export function listAccounts(): Promise<Account[]> {
  return request<Account[]>('/accounts')
}

export function createAccount(input: CreateAccountInput): Promise<Account> {
  return request<Account>('/accounts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function withdraw(accountId: string, amount: string): Promise<WithdrawalResult> {
  return request<WithdrawalResult>(`/accounts/${accountId}/withdrawals`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
}
