import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }
export class ErrorBoundary extends Component<Props, State> { state: State = { hasError: false }; static getDerivedStateFromError(): State { return { hasError: true } }; componentDidCatch(error: Error, info: ErrorInfo) { console.error('Atlas UI error', error, info) }; render() { return this.state.hasError ? <main className="error-screen"><h1>Something went wrong.</h1><p>Refresh the workspace to try again.</p><button className="button primary" onClick={() => window.location.reload()}>Refresh workspace</button></main> : this.props.children } }
