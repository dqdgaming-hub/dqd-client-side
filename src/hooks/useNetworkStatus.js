import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * Tracks browser connectivity AND pings your API's health endpoint,
 * so "offline" covers both "wifi is off" and "server unreachable / not responding".
 *
 * @param {string} pingUrl - e.g. `${import.meta.env.VITE_API_BASE_URL}/health/`
 * @param {number} pingInterval - ms between health checks (default 15s)
 * @param {number} pingTimeout - ms before a single health check is considered failed (default 5s)
 */
export default function useNetworkStatus({ pingUrl, pingInterval = 15000, pingTimeout = 5000 } = {}) {
  const [browserOffline, setBrowserOffline] = useState(!navigator.onLine)
  const [serverDown, setServerDown] = useState(false)
  const [checking, setChecking] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const goOffline = () => setBrowserOffline(true)
    const goOnline = () => {
      setBrowserOffline(false)
      // Re-check server immediately once the browser thinks it's back online
      checkServer()
    }
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkServer = useCallback(async () => {
    if (!pingUrl) return
    setChecking(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), pingTimeout)
      const res = await fetch(pingUrl, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      })
      clearTimeout(timeoutId)
      if (mountedRef.current) setServerDown(!res.ok)
    } catch {
      if (mountedRef.current) setServerDown(true)
    } finally {
      if (mountedRef.current) setChecking(false)
    }
  }, [pingUrl, pingTimeout])

  useEffect(() => {
    if (!pingUrl) return
    checkServer()
    const id = setInterval(checkServer, pingInterval)
    return () => clearInterval(id)
  }, [pingUrl, pingInterval, checkServer])

  return {
    isOffline: browserOffline || serverDown,
    browserOffline,
    serverDown,
    checking,
    recheck: checkServer,
  }
}