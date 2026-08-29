const isLocalHost = () => (
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname)
)

const hasDebugFlag = () => (
  typeof window !== 'undefined' &&
  window.location.search.includes('debug=true')
)

export const installProductionConsoleGuard = () => {
  if (typeof window === 'undefined' || isLocalHost() || hasDebugFlag()) return

  window.__3DSS_PRODUCTION_CONSOLE__ = true
  console.debug = () => {}
  console.info = () => {}
  console.log = () => {}
}
