import { apiBaseUrl } from './api'

export type FieldErrors = Record<string, string>

export type AuthSuccess = {
  success: true
  firstName: string | null
}

export type AuthFailure = {
  success: false
  errors: FieldErrors
  formError?: string
}

export type AuthResult = AuthSuccess | AuthFailure

export type RegisterPayload = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export type LoginPayload = {
  email: string
  password: string
}

const TOKEN_KEY = 'token'
const FIRST_NAME_KEY = 'firstName'

function normalizeFieldErrors(errors: FieldErrors): FieldErrors {
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [key.charAt(0).toLowerCase() + key.slice(1), value]),
  )
}

async function parseAuthResponse(response: Response): Promise<AuthResult> {
  const data = (await response.json().catch(() => ({}))) as {
    token?: string
    firstName?: string
    errors?: FieldErrors
  }

  if (response.ok && data.token) {
    localStorage.setItem(TOKEN_KEY, data.token)
    if (data.firstName) {
      localStorage.setItem(FIRST_NAME_KEY, data.firstName)
    }
    return { success: true, firstName: data.firstName ?? getFirstName() }
  }

  if (response.status >= 500) {
    return {
      success: false,
      errors: {},
      formError: 'Server error. Check that PostgreSQL is running and your connection string is correct.',
    }
  }

  if (data.errors && Object.keys(data.errors).length > 0) {
    return { success: false, errors: normalizeFieldErrors(data.errors) }
  }

  return {
    success: false,
    errors: {},
    formError: response.status === 401 || response.status === 400
      ? 'Invalid email or password.'
      : 'Something went wrong. Please try again.',
  }
}

function networkError(): AuthFailure {
  return {
    success: false,
    errors: {},
    formError: 'Unable to reach the server. Start the API with: dotnet run (from the Story.API folder).',
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        confirmPassword: payload.confirmPassword,
      }),
    })

    return parseAuthResponse(response)
  } catch {
    return networkError()
  }
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    })

    return parseAuthResponse(response)
  } catch {
    return networkError()
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getFirstName(): string | null {
  return localStorage.getItem(FIRST_NAME_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getToken())
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(FIRST_NAME_KEY)
}
