import { useEffect } from 'react'

// A pop-up window. Props: title (shown at the top), onClose (called to close it),
// children (whatever goes inside).
function Modal({ title, onClose, children }) {
  useEffect(() => {
    // Close when the Escape key is pressed
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    // Stop the page behind from scrolling while the pop-up is open
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Cleanup: runs when the pop-up closes, to undo both things above
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = oldOverflow
    }
  }, [onClose])

  return (
    // The dark backdrop. Clicking it closes the pop-up.
    <div
      className="overlay-enter fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      {/* The white box. stopPropagation: clicks inside it must NOT close the pop-up. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal-enter w-full max-w-md rounded-2xl bg-paper p-6 shadow-2xl shadow-ink/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="font-display text-2xl font-semibold">{title}</h2>

          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted hover:bg-cream hover:text-ink transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

export default Modal