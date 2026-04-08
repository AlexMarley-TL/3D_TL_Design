import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { getProjectByCode } from '../data/projects.ts'
import { PasscodeEntry } from '../components/PasscodeEntry.tsx'
import { DesignOption } from '../components/DesignOption.tsx'

interface ClientPortalProps {
  onModelChange: (path: string | null) => void
}

export function ClientPortal({ onModelChange }: ClientPortalProps) {
  const { code } = useParams<{ code: string }>()
  const project = getProjectByCode(code ?? '')
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    onModelChange(null)
  }, [onModelChange])

  useEffect(() => {
    if (code && localStorage.getItem(`portal_auth_${code}`) === 'true') {
      setAuthenticated(true)
    }
  }, [code])

  if (!project) {
    return (
      <div className="portal-page">
        <p className="trophy-not-found">Project not found</p>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <PasscodeEntry
        projectCode={project.code}
        storedHash={project.passcode}
        projectName={project.projectName}
        clientName={project.clientName}
        onAuthenticated={() => setAuthenticated(true)}
      />
    )
  }

  return (
    <div className="portal-page">
      <header className="portal-header">
        <p className="portal-client-name">{project.clientName}</p>
        <h1 className="portal-project-name">{project.projectName}</h1>
        <p className="portal-option-count">
          {project.designOptions.length} Design Option{project.designOptions.length !== 1 ? 's' : ''}
        </p>
      </header>
      <div className="portal-options">
        {project.designOptions.map((option) => (
          <DesignOption key={option.slug} option={option} projectCode={project.code} />
        ))}
      </div>
    </div>
  )
}
