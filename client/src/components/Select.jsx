import { useState, useRef, useEffect } from 'react'

// Two sizes: "md" for the page header, "sm" for small menus inside cards
const SIZES = {
  md: { trigger: 'rounded-full bg-paper px-4 py-2.5 font-medium', option: 'text-sm px-3 py-2' },
  sm: { trigger: 'rounded-lg bg-cream px-2.5 py-1.5 text-xs', option: 'text-xs px-2.5 py-1.5' },
}

// Props:
//   value      the currently selected value
//   onChange   called with the new value when the user picks an option
//   options    a list like [{ value: 'a', label: 'Option A' }, ...]
//   ariaLabel  a name for screen readers
//   size       "md" or "sm"
//   className  extra classes for the outer box (for example a maximum width)
function Select({ value, onChange, options, ariaLabel, size = 'md', className = '' }) {
  const [open, setOpen] = useState(false) // is the list showing?
  const rootRef = useRef(null)            // the whole component
  const triggerRef = useRef(null)         // the button you click to open it
  const optionRefs = useRef([])           // the option buttons, so we can focus them

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => String(o.value) === String(value))
  )
  const selected = options[selectedIndex]
  const look = SIZES[size]

  // While the list is open: close it when you click anywhere outside,
  // and move keyboard focus onto the selected option so the arrow keys work.
  useEffect(() => {
    if (!open) return

    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    optionRefs.current[selectedIndex]?.focus()

    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open, selectedIndex])

  // The user picked an option: tell the parent, close the list, return focus to the button
  function choose(option) {
    onChange(option.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  // Keyboard on the button: arrow keys open the list
  function onTriggerKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
    }
  }

  // Keyboard inside the open list: arrows move, Escape closes.
  // Enter and Space work by themselves because each option is a real button.
  function onListKeyDown(e) {
    const current = optionRefs.current.indexOf(document.activeElement)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      optionRefs.current[Math.min(current + 1, options.length - 1)]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      optionRefs.current[Math.max(current - 1, 0)]?.focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    // z-30 while open, so the list floats above the cards around it
    <div ref={rootRef} className={'relative ' + (open ? 'z-30 ' : '') + className}>
      {/* ---------- The button that shows the current choice ---------- */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={onTriggerKeyDown}
        className={
          'flex w-full items-center justify-between gap-2 border transition-colors ' +
          look.trigger +
          ' ' +
          (open ? 'border-clay' : 'border-sand hover:border-clay/60')
        }
      >
        {/* truncate cuts a very long name with "..." */}
        <span className="truncate">{selected?.label}</span>

        {/* A chevron that flips when the list is open */}
        <svg
          viewBox="0 0 24 24"
          className={'h-4 w-4 shrink-0 text-muted transition-transform ' + (open ? 'rotate-180' : '')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* ---------- The list of options ---------- */}
      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          onKeyDown={onListKeyDown}
          className="page-enter absolute left-0 z-30 mt-2 max-h-64 w-max min-w-full max-w-[18rem] overflow-auto rounded-xl border border-sand bg-paper p-1 shadow-lg shadow-ink/10"
        >
          {options.map((option, i) => {
            const isSelected = i === selectedIndex
            return (
              <button
                key={option.value}
                ref={(el) => {
                  optionRefs.current[i] = el
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(option)}
                className={
                  'flex w-full items-center justify-between gap-3 rounded-lg text-left transition-colors hover:bg-clay/10 focus:bg-clay/10 ' +
                  look.option +
                  (isSelected ? ' font-semibold text-clay-dark' : '')
                }
              >
                <span className="truncate">{option.label}</span>

                {/* A check mark beside the chosen option */}
                {isSelected && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Select