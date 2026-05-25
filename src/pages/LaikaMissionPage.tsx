import Editor, { type OnMount } from '@monaco-editor/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import MoscowNightBackground from '../components/MoscowNightBackground'
import { useLaikaChapter1Audio } from '../hooks/useLaikaChapter1Audio'
import {
  completeLaikaChapter1,
  fetchLaikaMissionProgress,
  saveLaikaMissionProgress,
  type LaikaMissionPhase,
} from '../services/missionProgressService'
import {
  evaluateLaikaCandidates,
  LAIKA_SELECTION_STARTER_CODE,
} from '../utils/evaluateLaikaCandidates'
import {
  getBeatFullText,
  LAIKA_CHAPTER1_BEATS,
} from '../utils/laikaChapter1Script'

const BEAT_COUNT = LAIKA_CHAPTER1_BEATS.length
import '../styles/laika-mission-page.css'

const CHAR_DELAY_MS = 48
const PROGRESS_SAVE_DEBOUNCE_MS = 1200
const EDITOR_FONT_SIZE = 14
const EDITOR_LINE_HEIGHT = 22
const EDITOR_VERTICAL_PADDING = 20

function editorHeightForLineCount(lineCount: number): number {
  return lineCount * EDITOR_LINE_HEIGHT + EDITOR_VERTICAL_PADDING
}

const INITIAL_EDITOR_HEIGHT = editorHeightForLineCount(
  LAIKA_SELECTION_STARTER_CODE.split('\n').length,
)

type MissionPhase = LaikaMissionPhase

function MuteButton({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`laika-mission__mute ${muted ? 'laika-mission__mute--off' : ''}`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      aria-pressed={muted}
    >
      {muted ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      )}
    </button>
  )
}

function ChapterIndicator({ chapter }: { chapter: number }) {
  return (
    <div className="laika-mission__chapter-indicator">
      <p className="laika-mission__chapter-label">Chapter {chapter}</p>
      <div className="laika-mission__chapter-dots" aria-hidden="true">
        <span className={`laika-mission__chapter-dot ${chapter === 1 ? 'laika-mission__chapter-dot--active' : ''}`} />
        <span className={`laika-mission__chapter-dot ${chapter === 2 ? 'laika-mission__chapter-dot--active' : ''}`} />
        <span className="laika-mission__chapter-dot" />
      </div>
    </div>
  )
}

function LaikaMissionPage() {
  const [phase, setPhase] = useState<MissionPhase>('narrative')
  const [displayChapter, setDisplayChapter] = useState(1)
  const [muted, setMuted] = useState(false)
  const [progressReady, setProgressReady] = useState(false)

  const [beatIndex, setBeatIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [linePause, setLinePause] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  const [editorCode, setEditorCode] = useState(LAIKA_SELECTION_STARTER_CODE)
  const [editorHeight, setEditorHeight] = useState(INITIAL_EDITOR_HEIGHT)
  const [exerciseFading, setExerciseFading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [chapter2Active, setChapter2Active] = useState(false)
  const [chapter2TextVisible, setChapter2TextVisible] = useState(false)

  const saveTimerRef = useRef<number | null>(null)
  const progressInitializedRef = useRef(false)

  const currentBeat = LAIKA_CHAPTER1_BEATS[beatIndex]
  const currentBeatText = currentBeat ? getBeatFullText(currentBeat) : ''
  const audioEnabled = progressReady && (phase === 'narrative' || phase === 'exercise')

  useLaikaChapter1Audio({ enabled: audioEnabled, muted })

  const persistProgress = useCallback(
    (nextPhase: MissionPhase, nextBeatIndex: number, completedChapter?: number) => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current)
      }

      saveTimerRef.current = window.setTimeout(() => {
        void saveLaikaMissionProgress({
          phase: nextPhase,
          narrativeSegmentIndex: nextBeatIndex,
          currentChapter: nextPhase === 'chapter2' ? 2 : 1,
          lastCompletedChapter: completedChapter,
        })
      }, PROGRESS_SAVE_DEBOUNCE_MS)
    },
    [],
  )

  useEffect(() => {
    let cancelled = false

    const loadProgress = async () => {
      const progress = await fetchLaikaMissionProgress()
      if (cancelled) {
        return
      }

      if (progress.phase === 'chapter2' || progress.lastCompletedChapter >= 1) {
        setPhase('chapter2')
        setDisplayChapter(2)
        setChapter2Active(true)
        setChapter2TextVisible(true)
        setProgressReady(true)
        progressInitializedRef.current = true
        return
      }

      if (progress.phase === 'exercise') {
        setPhase('exercise')
        setDisplayChapter(1)
        setBeatIndex(BEAT_COUNT)
        setProgressReady(true)
        progressInitializedRef.current = true
        return
      }

      const resumeIndex = Math.min(progress.narrativeSegmentIndex, BEAT_COUNT)
      setBeatIndex(resumeIndex)
      setCharIndex(0)
      setPhase('narrative')
      setDisplayChapter(1)
      if (resumeIndex >= BEAT_COUNT) {
        setShowContinue(true)
      }
      setProgressReady(true)
      progressInitializedRef.current = true
    }

    void loadProgress()

    return () => {
      cancelled = true
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!progressReady || phase !== 'narrative' || showContinue || !currentBeat) {
      return
    }

    if (linePause) {
      if (currentBeat.waitForContinue) {
        setShowContinue(true)
        setLinePause(false)
        if (progressInitializedRef.current) {
          persistProgress('narrative', BEAT_COUNT)
        }
        return
      }

      const pauseTimer = window.setTimeout(() => {
        const nextIndex = beatIndex + 1
        setBeatIndex(nextIndex)
        setCharIndex(0)
        setLinePause(false)

        if (progressInitializedRef.current) {
          persistProgress('narrative', nextIndex)
        }
      }, currentBeat.holdMs)

      return () => window.clearTimeout(pauseTimer)
    }

    if (charIndex < currentBeatText.length) {
      const typeTimer = window.setTimeout(() => setCharIndex((index) => index + 1), CHAR_DELAY_MS)
      return () => window.clearTimeout(typeTimer)
    }

    setLinePause(true)
  }, [
    progressReady,
    phase,
    showContinue,
    currentBeat,
    currentBeatText.length,
    linePause,
    charIndex,
    beatIndex,
    persistProgress,
  ])

  const handleContinue = useCallback(() => {
    if (!showContinue || phase !== 'narrative') {
      return
    }

    setShowContinue(false)
    setPhase('exercise')
    persistProgress('exercise', BEAT_COUNT)
  }, [showContinue, phase, persistProgress])

  useEffect(() => {
    if (!showContinue) {
      return
    }

    const onKeyDown = () => handleContinue()
    const onClick = () => handleContinue()

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('click', onClick)
    }
  }, [showContinue, handleContinue])

  const handleSubmit = async () => {
    if (!evaluateLaikaCandidates(editorCode)) {
      setSuccessMessage('')
      setSubmitError('Not quite. Check your conditions and try again.')
      return
    }

    setSubmitError('')
    setSuccessMessage('Laika is selected. The mission begins.')

    await completeLaikaChapter1()

    window.setTimeout(() => {
      setExerciseFading(true)
    }, 2000)

    window.setTimeout(() => {
      setPhase('chapter2')
      setDisplayChapter(2)
      setChapter2Active(true)
      requestAnimationFrame(() => setChapter2TextVisible(true))
    }, 2800)
  }

  const handleEditorMount: OnMount = (monacoEditor) => {
    const syncHeight = () => {
      const lineCount = monacoEditor.getModel()?.getLineCount() ?? 1
      const contentHeight = monacoEditor.getContentHeight()
      setEditorHeight(Math.max(contentHeight, editorHeightForLineCount(lineCount)))
    }

    monacoEditor.updateOptions({
      lineHeight: EDITOR_LINE_HEIGHT,
      fixedOverflowWidgets: true,
      scrollbar: { vertical: 'hidden', horizontal: 'hidden', handleMouseWheel: false },
    })

    syncHeight()
    monacoEditor.onDidContentSizeChange(syncHeight)
  }

  const finalBeat = LAIKA_CHAPTER1_BEATS[BEAT_COUNT - 1]
  const finalBeatText = getBeatFullText(finalBeat)
  const displayBeat = showContinue ? finalBeat : currentBeat
  const displayBeatText = displayBeat ? getBeatFullText(displayBeat) : ''
  const showNarrative = phase === 'narrative' && displayBeat && (showContinue || !linePause || charIndex > 0)
  const narrativeText = showContinue ? finalBeatText : displayBeatText.slice(0, charIndex)
  const narrativeLines = narrativeText.length > 0 ? narrativeText.split('\n') : []
  const showCursor =
    !showContinue && currentBeat && charIndex < currentBeatText.length && !linePause

  if (!progressReady) {
    return <div className="laika-mission" />
  }

  return (
    <div className="laika-mission">
      <div className="laika-mission__bg-wrap">
        <MoscowNightBackground chapter2Active={chapter2Active} />
      </div>

      <div className="laika-mission__chrome">
        <ChapterIndicator chapter={displayChapter} />
        <MuteButton muted={muted} onToggle={() => setMuted((value) => !value)} />
      </div>

      {showNarrative ? (
        <div className="laika-mission__narrative">
          <div className="laika-mission__narrative-block">
            {narrativeLines.map((line, index) => (
              <p key={`line-${index}`} className="laika-mission__narrative-line">
                {line}
                {showCursor && index === narrativeLines.length - 1 ? (
                  <span className="laika-mission__cursor">|</span>
                ) : null}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {showContinue ? (
        <p className="laika-mission__continue">[ Press any key or click to continue ]</p>
      ) : null}

      {phase === 'exercise' ? (
        <div
          className={[
            'laika-mission__narrative',
            'laika-mission__narrative--exercise',
            exerciseFading ? 'laika-mission__narrative--fade-out' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="laika-mission__narrative-block">
            <p className="laika-mission__narrative-line">
              Mission Control needs your help before we continue.
            </p>
            <p className="laika-mission__narrative-line laika-mission__narrative-line--emphasis">
              The Selection
            </p>
            <p className="laika-mission__narrative-line laika-mission__narrative-line--soft">
              The scientists have gathered 4 dogs. Only those weighing less than 6kg with a calmness score of
              8 or higher qualify for the mission. Help Mission Control find the candidates.
            </p>

            <div className="laika-mission__editor">
              <Editor
                height={`${editorHeight}px`}
                width="100%"
                language="javascript"
                theme="vs-dark"
                value={editorCode}
                onMount={handleEditorMount}
                onChange={(value) => setEditorCode(value ?? '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: EDITOR_FONT_SIZE,
                  lineHeight: EDITOR_LINE_HEIGHT,
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  folding: false,
                  padding: { top: 10, bottom: 10 },
                  renderLineHighlight: 'none',
                  overviewRulerLanes: 0,
                  hideCursorInOverviewRuler: true,
                  scrollbar: { vertical: 'hidden', horizontal: 'hidden', handleMouseWheel: false },
                  fixedOverflowWidgets: true,
                }}
              />
            </div>

            <p className="laika-mission__narrative-line laika-mission__narrative-line--hint">
              Hint: Use dot notation to access each dog&apos;s properties. Example: dog.weight
            </p>

            <button type="button" className="laika-mission__submit" onClick={() => void handleSubmit()}>
              Submit
            </button>

            {submitError ? (
              <p className="laika-mission__message laika-mission__message--error" role="alert">
                {submitError}
              </p>
            ) : null}

            {successMessage ? (
              <p className="laika-mission__message laika-mission__message--success" role="status">
                {successMessage}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div
        className={`laika-mission__chapter2-placeholder ${chapter2TextVisible ? 'laika-mission__chapter2-placeholder--visible' : ''}`}
      >
        <p className="laika-mission__chapter2-text">Chapter 2 — The Laboratory</p>
      </div>
    </div>
  )
}

export default LaikaMissionPage
