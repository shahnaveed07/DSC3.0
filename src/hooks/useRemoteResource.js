import { useEffect, useRef, useState } from 'react'

export function useRemoteResource(loader, deps = [], options = {}) {
  const { enabled = true, initialData = null } = options
  const [data, setData] = useState(initialData)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(Boolean(enabled))
  const loaderRef = useRef(loader)
  const initialDataRef = useRef(initialData)
  loaderRef.current = loader
  initialDataRef.current = initialData

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()
    let active = true

    setLoading(true)
    setError(null)

    Promise.resolve(loaderRef.current(controller.signal))
      .then((result) => {
        if (!active) return
        setData(result)
        setError(null)
      })
      .catch((nextError) => {
        if (!active || nextError?.name === 'AbortError') return
        setData(initialDataRef.current)
        setError(nextError)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  return { data, error, loading: enabled ? loading : false, setData }
}
