import { useEffect } from 'react'
import {
  destroyLaikaAmbience,
  setLaikaAmbienceMuted,
  startLaikaAmbience,
} from '../audio/laikaAmbience'

type UseLaikaChapter1AudioOptions = {
  enabled: boolean
  muted: boolean
}

export function useLaikaChapter1Audio({ enabled, muted }: UseLaikaChapter1AudioOptions) {
  useEffect(() => {
    if (enabled) {
      startLaikaAmbience()
    } else {
      destroyLaikaAmbience()
    }

    return () => {
      destroyLaikaAmbience()
    }
  }, [enabled])

  useEffect(() => {
    setLaikaAmbienceMuted(muted)
  }, [muted])
}
