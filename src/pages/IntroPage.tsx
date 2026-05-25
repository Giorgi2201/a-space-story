import Editor from '@monaco-editor/react'
import { useCallback, useEffect, useMemo, useRef, useState, type TransitionEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import StarField from '../components/StarField'
import { getFirstName } from '../services/authService'
import { evaluateMissingWord, STARTER_CODE } from '../utils/evaluateMissingWord'
import { hasSeenIntro, markIntroSeen } from '../utils/introStorage'
import '../styles/intro-page.css'
import '../styles/starfield.css'

const CHAR_DELAY_MS = 52
const LINE_PAUSE_MS = 1250
const HELLO_PAUSE_MS = 1500
const QUOTE_PREFIX = 'The cosmos is within us. We are made of '
const QUOTE_SUFFIX = ' stuff.'

type IntroStep = 'hello' | 'sequence' | 'challenge' | 'hyperspace'

type SequencePhase =
  | 'typing-lines'
  | 'typing-quote-prefix'
  | 'typing-quote-blank'
  | 'typing-quote-suffix'
  | 'quote-ready'

function QuoteBlank({
  interactive,
  visible,
  onClick,
}: {
  interactive: boolean
  visible: boolean
  onClick?: () => void
}) {
  const className = [
    'intro-blank-slot',
    visible ? 'intro-blank-slot--visible' : '',
    interactive ? 'intro-blank-slot--revealed intro-blank-slot--pulse' : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (interactive) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        aria-label="Click the blank to continue"
      />
    )
  }

  return <span className={className} aria-hidden="true" />
}

function IntroPage() {
  const navigate = useNavigate()
  const displayName = getFirstName() ?? 'Traveler'

  const helloLine = useMemo(() => `Hello, ${displayName}.`, [displayName])

  const bodyLines = useMemo(
    () => [
      'You are about to embark on a journey.',
      'A journey through the cosmos.',
      'But first... complete the unknown.',
    ],
    [],
  )

  const [step, setStep] = useState<IntroStep>('hello')
  const [helloCharIndex, setHelloCharIndex] = useState(0)
  const [helloFadingOut, setHelloFadingOut] = useState(false)
  const helloPauseScheduledRef = useRef(false)

  const [sequencePhase, setSequencePhase] = useState<SequencePhase>('typing-lines')
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [linePause, setLinePause] = useState(false)
  const [completedLines, setCompletedLines] = useState<string[]>([])
  const [quotePrefix, setQuotePrefix] = useState('')
  const [blankVisible, setBlankVisible] = useState(false)
  const [quoteSuffix, setQuoteSuffix] = useState('')

  const [editorCode, setEditorCode] = useState(STARTER_CODE)
  const [submitError, setSubmitError] = useState('')
  const [starRevealed, setStarRevealed] = useState(false)
  const [starFieldFadedIn, setStarFieldFadedIn] = useState(false)
  const [authorVisible, setAuthorVisible] = useState(false)
  const [challengeVisible, setChallengeVisible] = useState(false)

  useEffect(() => {
    if (hasSeenIntro()) {
      navigate('/home', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (step !== 'hello') {
      helloPauseScheduledRef.current = false
      return
    }

    if (helloCharIndex < helloLine.length) {
      const timer = window.setTimeout(() => setHelloCharIndex((index) => index + 1), CHAR_DELAY_MS)
      return () => window.clearTimeout(timer)
    }

    if (!helloPauseScheduledRef.current) {
      helloPauseScheduledRef.current = true
      const timer = window.setTimeout(() => setHelloFadingOut(true), HELLO_PAUSE_MS)
      return () => window.clearTimeout(timer)
    }
  }, [step, helloCharIndex, helloLine.length])

  const handleHelloFadeEnd = (event: TransitionEvent<HTMLParagraphElement>) => {
    if (event.propertyName !== 'opacity' || !helloFadingOut) {
      return
    }

    setStep('sequence')
    setSequencePhase('typing-lines')
    setLineIndex(0)
    setCharIndex(0)
  }

  const currentIntroLine = bodyLines[lineIndex] ?? ''

  useEffect(() => {
    if (step !== 'sequence') {
      return
    }

    if (linePause) {
      const timer = window.setTimeout(() => {
        setLinePause(false)
        if (lineIndex < bodyLines.length - 1) {
          setLineIndex((index) => index + 1)
          setCharIndex(0)
          return
        }

        setCompletedLines(bodyLines)
        setSequencePhase('typing-quote-prefix')
        setCharIndex(0)
      }, LINE_PAUSE_MS)
      return () => window.clearTimeout(timer)
    }

    if (sequencePhase === 'typing-lines') {
      if (charIndex < currentIntroLine.length) {
        const timer = window.setTimeout(() => setCharIndex((index) => index + 1), CHAR_DELAY_MS)
        return () => window.clearTimeout(timer)
      }

      if (charIndex >= currentIntroLine.length) {
        setCompletedLines((lines) => {
          const next = [...lines]
          next[lineIndex] = currentIntroLine
          return next
        })
        setLinePause(true)
      }
      return
    }

    if (sequencePhase === 'typing-quote-prefix') {
      if (charIndex < QUOTE_PREFIX.length) {
        const timer = window.setTimeout(() => {
          const nextIndex = charIndex + 1
          setCharIndex(nextIndex)
          setQuotePrefix(QUOTE_PREFIX.slice(0, nextIndex))
          if (nextIndex >= QUOTE_PREFIX.length) {
            setSequencePhase('typing-quote-blank')
            setBlankVisible(true)
          }
        }, CHAR_DELAY_MS)
        return () => window.clearTimeout(timer)
      }
      return
    }

    if (sequencePhase === 'typing-quote-blank') {
      const timer = window.setTimeout(() => {
        setSequencePhase('typing-quote-suffix')
        setCharIndex(0)
      }, CHAR_DELAY_MS)
      return () => window.clearTimeout(timer)
    }

    if (sequencePhase === 'typing-quote-suffix') {
      if (charIndex < QUOTE_SUFFIX.length) {
        const timer = window.setTimeout(() => {
          setCharIndex((index) => index + 1)
          setQuoteSuffix(QUOTE_SUFFIX.slice(0, charIndex + 1))
        }, CHAR_DELAY_MS)
        return () => window.clearTimeout(timer)
      }

      const doneTimer = window.setTimeout(() => setSequencePhase('quote-ready'), LINE_PAUSE_MS)
      return () => window.clearTimeout(doneTimer)
    }
  }, [step, sequencePhase, linePause, charIndex, currentIntroLine, lineIndex, bodyLines])

  const handleBlankClick = () => {
    if (sequencePhase !== 'quote-ready') {
      return
    }
    setStep('challenge')
  }

  const handleSubmit = () => {
    const answer = evaluateMissingWord(editorCode)
    if (!answer || answer.trim().toLowerCase() !== 'star') {
      setSubmitError('Not quite. Think about what we are all made of.')
      return
    }

    setSubmitError('')
    setStarRevealed(true)

    window.setTimeout(() => {
      setStep('hyperspace')
    }, 500)
  }

  const handleWarpComplete = useCallback(() => {
    markIntroSeen()
    navigate('/home', { replace: true })
  }, [navigate])

  const showStarField = step !== 'hello'

  useEffect(() => {
    if (step === 'sequence') {
      const frame = requestAnimationFrame(() => setStarFieldFadedIn(true))
      return () => cancelAnimationFrame(frame)
    }

    if (step === 'hello') {
      setStarFieldFadedIn(false)
    }
  }, [step])

  useEffect(() => {
    if (sequencePhase === 'quote-ready' && step === 'sequence') {
      const timer = window.setTimeout(() => setAuthorVisible(true), 50)
      return () => window.clearTimeout(timer)
    }
  }, [sequencePhase, step])

  useEffect(() => {
    if (step === 'challenge') {
      const frame = requestAnimationFrame(() => setChallengeVisible(true))
      return () => cancelAnimationFrame(frame)
    }

    setChallengeVisible(false)
  }, [step])

  const showIntroCursor =
    sequencePhase === 'typing-lines' && charIndex < currentIntroLine.length && !linePause

  const showQuoteCursor =
    (sequencePhase === 'typing-quote-prefix' && charIndex < QUOTE_PREFIX.length) ||
    sequencePhase === 'typing-quote-blank' ||
    (sequencePhase === 'typing-quote-suffix' && charIndex < QUOTE_SUFFIX.length)

  const quoteInteractive = sequencePhase === 'quote-ready'

  return (
    <>
      {showStarField ? (
        <StarField
          speed={1.5}
          warping={step === 'hyperspace'}
          onWarpComplete={handleWarpComplete}
          zIndex={0}
          className={`starfield--fade-in ${starFieldFadedIn ? 'starfield--visible' : ''}`}
        />
      ) : null}

      {step !== 'hyperspace' ? (
    <div className={`intro-page ${step === 'hello' ? 'intro-page--hello-only' : ''}`}>
      <div className="intro-page__content">
        {step === 'hello' ? (
          <p
            className={`intro-line intro-line--hello ${helloFadingOut ? 'intro-line--hello-fade-out' : ''}`}
            onTransitionEnd={handleHelloFadeEnd}
          >
            {helloLine.slice(0, helloCharIndex)}
            {helloCharIndex < helloLine.length ? (
              <span className="intro-line__cursor">|</span>
            ) : null}
          </p>
        ) : null}

        {step === 'sequence' ? (
          <>
            {completedLines.map((line, index) => (
              <p key={`line-${index}`} className="intro-line">
                {line}
              </p>
            ))}

            {sequencePhase === 'typing-lines' && charIndex < currentIntroLine.length ? (
              <p className="intro-line">
                {currentIntroLine.slice(0, charIndex)}
                {showIntroCursor ? <span className="intro-line__cursor">|</span> : null}
              </p>
            ) : null}

            {sequencePhase !== 'typing-lines' ? (
              <div className="intro-quote-wrap">
                <p className="intro-line intro-line--quote">
                  {quotePrefix}
                  <QuoteBlank
                    visible={blankVisible}
                    interactive={quoteInteractive}
                    onClick={handleBlankClick}
                  />
                  {quoteSuffix}
                  {showQuoteCursor ? <span className="intro-line__cursor">|</span> : null}
                </p>
              </div>
            ) : null}

            {sequencePhase === 'quote-ready' ? (
              <p
                className={`intro-line intro-line--quote-author ${authorVisible ? 'intro-line--quote-author-visible' : ''}`}
              >
                — Carl Sagan
              </p>
            ) : null}
          </>
        ) : null}

        {step === 'challenge' ? (
          <>
            {completedLines.map((line, index) => (
              <p key={`line-${index}`} className="intro-line">
                {line}
              </p>
            ))}

            <p className="intro-line intro-line--quote">
              {QUOTE_PREFIX}
              {starRevealed ? (
                <span className="intro-word--star">star</span>
              ) : (
                <QuoteBlank visible interactive={false} />
              )}
              {QUOTE_SUFFIX}
            </p>

            <p className="intro-line intro-line--quote-author intro-line--quote-author-visible">
              — Carl Sagan
            </p>

            <div className={`intro-challenge ${challengeVisible ? 'intro-challenge--visible' : ''}`}>
              <div className="intro-challenge__instructions">
                <p className="intro-challenge__instruction-line">
                  Type the missing word between the quotes below.
                </p>
                <p className="intro-challenge__instruction-line">
                  Hint: What are we all made of?
                </p>
              </div>

              <div className="intro-challenge__editor">
                <Editor
                  height="140px"
                  width="300px"
                  language="javascript"
                  theme="vs-dark"
                  value={editorCode}
                  onChange={(value) => setEditorCode(value ?? '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'off',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    padding: { top: 10, bottom: 10 },
                    renderLineHighlight: 'none',
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                  }}
                />
              </div>
              <button type="button" className="intro-challenge__submit" onClick={handleSubmit}>
                Submit Answer
              </button>
              {submitError ? (
                <p className="intro-challenge__error" role="alert">
                  {submitError}
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
      ) : null}
    </>
  )
}

export default IntroPage
