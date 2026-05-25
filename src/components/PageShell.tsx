import type { ReactNode } from 'react'
import '../styles/page-shell.css'

type PageShellProps = {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}

function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <main className="page-shell">
      <div className="page-shell__orb page-shell__orb--left" aria-hidden="true" />
      <div className="page-shell__orb page-shell__orb--right" aria-hidden="true" />
      <section className="page-shell__card">
        <p className="page-shell__eyebrow">{eyebrow}</p>
        <h1 className="page-shell__title">{title}</h1>
        <p className="page-shell__description">{description}</p>
        {children}
      </section>
    </main>
  )
}

export default PageShell
