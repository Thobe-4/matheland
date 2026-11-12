import { useEffect } from 'react'

interface NumberPadProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'] as const

export function NumberPad({ value, onChange, onSubmit, disabled }: NumberPadProps) {
  const press = (key: (typeof KEYS)[number]) => {
    if (disabled) return
    if (key === 'OK') {
      onSubmit()
      return
    }
    if (key === '⌫') {
      onChange(value.slice(0, -1))
      return
    }
    if (value.length >= 4) return
    onChange(value + key)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return
      if (e.key >= '0' && e.key <= '9') {
        if (value.length < 4) onChange(value + e.key)
      } else if (e.key === 'Backspace') {
        onChange(value.slice(0, -1))
      } else if (e.key === 'Enter') {
        onSubmit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [value, onChange, onSubmit, disabled])

  return (
    <div className="numpad" role="group" aria-label="Zahleneingabe">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className={
            key === 'OK'
              ? 'numpad__key numpad__key--ok'
              : key === '⌫'
                ? 'numpad__key numpad__key--del'
                : 'numpad__key'
          }
          onClick={() => press(key)}
          disabled={disabled || (key === 'OK' && value.length === 0)}
        >
          {key}
        </button>
      ))}
    </div>
  )
}
