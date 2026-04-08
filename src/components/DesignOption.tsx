import { useState } from 'react'
import { Link } from 'react-router'
import type { DesignOption as DesignOptionType } from '../types/index.ts'

interface DesignOptionProps {
  option: DesignOptionType
  projectCode: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function DesignOption({ option, projectCode }: DesignOptionProps) {
  const [expanded, setExpanded] = useState(false)

  if (option.iterations.length === 1) {
    const iteration = option.iterations[0]
    return (
      <Link
        to={`/project/${projectCode}/${iteration.slug}`}
        className="design-option"
      >
        <div className="design-option-header">
          <span className="design-option-name">{option.name}</span>
          <span className="design-option-chevron">{'\u203A'}</span>
        </div>
      </Link>
    )
  }

  return (
    <div className="design-option">
      <div
        className="design-option-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="design-option-name">{option.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="design-option-badge">
            {option.iterations.length} iterations
          </span>
          <span
            className="design-option-chevron"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            {'\u203A'}
          </span>
        </div>
      </div>
      <div
        className="design-option-iterations"
        style={{ maxHeight: expanded ? '500px' : '0' }}
      >
        {option.iterations.map((iteration) => (
          <Link
            key={iteration.slug}
            to={`/project/${projectCode}/${iteration.slug}`}
            className="iteration-row"
          >
            <img
              className="iteration-thumb"
              src={iteration.thumbnailPath}
              alt={iteration.label}
            />
            <div className="iteration-info">
              <div className="iteration-label">
                {iteration.slug} — {iteration.label}
              </div>
              <div className="iteration-date">
                {formatDate(iteration.dateAdded)}
              </div>
            </div>
            <span className="design-option-chevron">{'\u203A'}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
