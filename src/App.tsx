import './App.css'

export default function App() {
  return (
    <div className="shell">
      <a className="skip" href="#main">
        Skip to content
      </a>

      <header className="mast">
        <a className="wordmark" href="/">
          <span className="wordmark-mark" aria-hidden="true">
            ⌘
          </span>
          Shortcut
        </a>
        <p className="mast-status">App shell</p>
      </header>

      <main id="main" className="stage">
        <div className="keycap" aria-hidden="true">
          <span className="keycap-legend">⌘</span>
        </div>
        <h1>Ready when you are</h1>
        <p className="lede">
          This is the installable shell. Product features land here later.
        </p>
      </main>

      <footer className="status">
        <span>PWA scaffold</span>
        <span className="status-dot" aria-hidden="true" />
        <span>Offline after first visit</span>
      </footer>
    </div>
  )
}
