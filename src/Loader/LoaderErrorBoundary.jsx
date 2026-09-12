import { Component } from 'react'
import PageLoader from './PageLoader'

const CHUNK_ERROR_PATTERN = /Failed to fetch dynamically imported module|Loading chunk|ChunkLoadError|error loading dynamically imported module/i

export default class LoaderErrorBoundary extends Component {
  state = { hasError: false, isChunkError: false }

  static getDerivedStateFromError(error) {
    const isChunkError = CHUNK_ERROR_PATTERN.test(error?.message || '')
    return { hasError: true, isChunkError }
  }

  componentDidCatch(error, info) {
    if (this.state.isChunkError) {
      // Usually means a new version was deployed while the user had the old
      // page open, and the old JS chunk hash 404s. A hard reload fixes it.
      console.warn('Chunk load failed (stale deploy or server unreachable):', error, info)
    } else {
      console.error('Uncaught render error:', error, info)
    }
  }

  handleRetry = () => {
    // Hard reload clears out stale chunk references
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return <PageLoader isOffline forceError onRetry={this.handleRetry} />
    }
    return this.props.children
  }
}