import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StarField from '../components/StarField'
import { login, register, type FieldErrors } from '../services/authService'
import { validateLoginForm, validateRegisterForm } from '../utils/authValidation'

type RegisterFormState = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

type LoginFormState = {
  email: string
  password: string
}

const emptyRegisterForm: RegisterFormState = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const emptyLoginForm: LoginFormState = {
  email: '',
  password: '',
}

const AuthPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const isRegisterRoute = location.pathname === '/register'

  const [isRegister, setIsRegister] = useState(isRegisterRoute)
  const [isFlipped, setIsFlipped] = useState(isRegisterRoute)
  const [isContentFlipped, setIsContentFlipped] = useState(isRegisterRoute)
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(emptyRegisterForm)
  const [loginForm, setLoginForm] = useState<LoginFormState>(emptyLoginForm)
  const [registerErrors, setRegisterErrors] = useState<FieldErrors>({})
  const [loginErrors, setLoginErrors] = useState<FieldErrors>({})
  const [registerFormError, setRegisterFormError] = useState('')
  const [loginFormError, setLoginFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsRegister(isRegisterRoute)
    setIsFlipped(isRegisterRoute)
    setIsContentFlipped(isRegisterRoute)
  }, [isRegisterRoute])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsFlipped(!isFlipped)
    setRegisterErrors({})
    setLoginErrors({})
    setRegisterFormError('')
    setLoginFormError('')

    setTimeout(() => {
      setIsRegister(!isRegister)
      setIsContentFlipped(!isContentFlipped)
      navigate(isRegister ? '/login' : '/register', { replace: true })
    }, 300)
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterFormError('')

    const validationErrors = validateRegisterForm(registerForm)
    setRegisterErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await register(registerForm)
      if (result.success) {
        navigate('/home', { replace: true, state: { notice: 'registered' } })
        return
      }

      setRegisterErrors(result.errors)
      if (result.formError) {
        setRegisterFormError(result.formError)
      }
    } catch {
      setRegisterFormError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginFormError('')

    const validationErrors = validateLoginForm(loginForm)
    setLoginErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await login(loginForm)
      if (result.success) {
        navigate('/home', { replace: true, state: { notice: 'logged-in' } })
        return
      }

      setLoginErrors(result.errors)
      if (result.formError) {
        setLoginFormError(result.formError)
      }
    } catch {
      setLoginFormError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderFieldError = (message?: string) =>
    message ? <span className="auth-field__error">{message}</span> : null

  const renderLoginForm = () => (
    <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
      <label className="auth-field">
        <span className="auth-field__label">Email</span>
        <input
          className="auth-field__input"
          type="email"
          placeholder="Enter your email"
          value={loginForm.email}
          onChange={(e) => {
            setLoginForm((current) => ({ ...current, email: e.target.value }))
            if (loginErrors.email) {
              setLoginErrors((current) => ({ ...current, email: '' }))
            }
          }}
        />
        {renderFieldError(loginErrors.email)}
      </label>
      <label className="auth-field">
        <span className="auth-field__label">Password</span>
        <input
          className="auth-field__input"
          type="password"
          placeholder="Enter your password"
          value={loginForm.password}
          onChange={(e) => {
            setLoginForm((current) => ({ ...current, password: e.target.value }))
            if (loginErrors.password) {
              setLoginErrors((current) => ({ ...current, password: '' }))
            }
          }}
        />
        {renderFieldError(loginErrors.password)}
      </label>
      {loginFormError ? <p className="auth-form__error">{loginFormError}</p> : null}
      <button className="auth-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
      <p className="auth-switch">
        <a href="/register" onClick={handleToggle}>Don&apos;t have an account? Register</a>
      </p>
    </form>
  )

  const renderRegisterForm = () => (
    <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
      <label className="auth-field">
        <span className="auth-field__label">Full Name</span>
        <input
          className="auth-field__input"
          type="text"
          placeholder="Enter your full name"
          value={registerForm.fullName}
          onChange={(e) => {
            setRegisterForm((current) => ({ ...current, fullName: e.target.value }))
            if (registerErrors.fullName) {
              setRegisterErrors((current) => ({ ...current, fullName: '' }))
            }
          }}
        />
        {renderFieldError(registerErrors.fullName)}
      </label>
      <label className="auth-field">
        <span className="auth-field__label">Email</span>
        <input
          className="auth-field__input"
          type="email"
          placeholder="Enter your email"
          value={registerForm.email}
          onChange={(e) => {
            setRegisterForm((current) => ({ ...current, email: e.target.value }))
            if (registerErrors.email) {
              setRegisterErrors((current) => ({ ...current, email: '' }))
            }
          }}
        />
        {renderFieldError(registerErrors.email)}
      </label>
      <label className="auth-field">
        <span className="auth-field__label">Password</span>
        <input
          className="auth-field__input"
          type="password"
          placeholder="Create a password"
          value={registerForm.password}
          onChange={(e) => {
            setRegisterForm((current) => ({ ...current, password: e.target.value }))
            if (registerErrors.password) {
              setRegisterErrors((current) => ({ ...current, password: '' }))
            }
          }}
        />
        {renderFieldError(registerErrors.password)}
      </label>
      <label className="auth-field">
        <span className="auth-field__label">Confirm Password</span>
        <input
          className="auth-field__input"
          type="password"
          placeholder="Confirm your password"
          value={registerForm.confirmPassword}
          onChange={(e) => {
            setRegisterForm((current) => ({ ...current, confirmPassword: e.target.value }))
            if (registerErrors.confirmPassword) {
              setRegisterErrors((current) => ({ ...current, confirmPassword: '' }))
            }
          }}
        />
        {renderFieldError(registerErrors.confirmPassword)}
      </label>
      {registerFormError ? <p className="auth-form__error">{registerFormError}</p> : null}
      <button className="auth-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Register'}
      </button>
      <p className="auth-switch">
        <a href="/login" onClick={handleToggle}>Already have an account? Login</a>
      </p>
    </form>
  )

  return (
    <>
      <StarField speed={1.5} warping={false} />
      <main className="auth-page">
        <div className={`auth-flip-container ${isFlipped ? 'is-flipped' : ''} ${isContentFlipped ? 'is-content-flipped' : ''}`}>
          <section className="auth-card">
            <h1 className="auth-card__title">A Space Story</h1>
            {isRegister ? renderRegisterForm() : renderLoginForm()}
          </section>
        </div>
      </main>
    </>
  )
}

export default AuthPage
