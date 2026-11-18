import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const ToastContext = createContext(null)

let nextId = 1 // gives every toast its own id

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]) // the toasts currently on screen

  // Removes one toast by its id
  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  // Adds a toast and removes it again after 3.5 seconds
  const show = useCallback(
    (type, text) => {
      const id = nextId++
      setToasts((list) => [...list, { id, type, text }])
      setTimeout(() => remove(id), 3500)
    },
    [remove]
  )

  // The two functions other components will use: toast.success(...) and toast.error(...)
  const toast = useMemo(
    () => ({
      success: (text) => show('success', text),
      error: (text) => show('error', text),
    }),
    [show]
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* The stack of toasts, fixed to the bottom-right corner of the screen */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <button
            key={t.id}
            onClick={() => remove(t.id)} // click a toast to dismiss it
            className={
              'toast-enter text-left max-w-sm rounded-xl border-l-4 bg-paper px-4 py-3 shadow-lg shadow-ink/10 ' +
              (t.type === 'success' ? 'border-teal' : 'border-clay')
            }
          >
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
              {t.type === 'success' ? 'Done' : 'Something went wrong'}
            </span>
            <span className="block text-sm break-words">{t.text}</span>
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// A shortcut so any component can write: const toast = useToast()
export function useToast() {
  return useContext(ToastContext)
}