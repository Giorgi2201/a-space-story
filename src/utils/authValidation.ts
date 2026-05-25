export type FieldErrors = Record<string, string>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegisterForm(values: {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Email format is invalid'
  }

  if (!values.password) {
    errors.password = 'Password is required'
  } else if (!isValidPassword(values.password)) {
    errors.password = 'Password does not meet requirements'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm password is required'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export function validateLoginForm(values: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Email format is invalid'
  }

  if (!values.password) {
    errors.password = 'Password is required'
  }

  return errors
}

function isValidPassword(password: string): boolean {
  if (password.length < 8 || password.length > 20) {
    return false
  }

  return /[A-Z]/.test(password) && /\d/.test(password)
}
