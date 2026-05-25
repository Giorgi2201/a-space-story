import type { ReactNode } from 'react'

type AuthLayoutProps = {
  title: string
  children: ReactNode
}

function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="auth-card__title">{title}</h1>
        {children}
      </section>
    </main>
  )
}

export default AuthLayout
