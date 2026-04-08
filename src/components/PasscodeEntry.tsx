import { useState, useEffect, type FormEvent } from 'react'
import { hashPasscode } from '../utils/crypto.ts'

interface PasscodeEntryProps {
  projectCode: string
  storedHash: string
  projectName: string
  clientName: string
  onAuthenticated: () => void
}

const MAX_ATTEMPTS = 5

export function PasscodeEntry({
  projectCode,
  storedHash,
  projectName,
  clientName,
  onAuthenticated,
}: PasscodeEntryProps) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(`portal_auth_${projectCode}`) === 'true') {
      onAuthenticated()
    }
  }, [projectCode, onAuthenticated])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (checking || passcode.length !== 4 || attempts >= MAX_ATTEMPTS) return

    setChecking(true)
    setError('')

    const hash = await hashPasscode(passcode)

    if (hash === storedHash) {
      localStorage.setItem(`portal_auth_${projectCode}`, 'true')
      onAuthenticated()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setPasscode('')
      if (newAttempts < MAX_ATTEMPTS) {
        setError('Incorrect passcode')
      }
    }

    setChecking(false)
  }

  if (attempts >= MAX_ATTEMPTS) {
    return (
      <div className="passcode-page">
        <div className="passcode-card">
          <div className="passcode-header">
            <p className="passcode-client-name">{clientName}</p>
            <h1 className="passcode-project-name">{projectName}</h1>
          </div>
          <p className="passcode-lockout">
            Too many incorrect attempts. Please contact your project manager.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="passcode-page">
      <div className="passcode-card">
        <div className="passcode-header">
          <p className="passcode-client-name">{clientName}</p>
          <h1 className="passcode-project-name">{projectName}</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            className="passcode-input"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            autoComplete="one-time-code"
            placeholder="----"
            value={passcode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              setPasscode(value)
            }}
            autoFocus
          />
          <button
            type="submit"
            className="passcode-submit"
            disabled={passcode.length !== 4 || checking}
          >
            {checking ? 'Verifying...' : 'Enter'}
          </button>
        </form>
        {error && <p className="passcode-error">{error}</p>}
      </div>
    </div>
  )
}
