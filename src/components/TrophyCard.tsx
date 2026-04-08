import { Link } from 'react-router'
import type { PublicTrophy } from '../types/index.ts'

interface TrophyCardProps {
  trophy: PublicTrophy
}

export function TrophyCard({ trophy }: TrophyCardProps) {
  return (
    <Link to={`/trophy/${trophy.slug}`} className="trophy-card">
      <div className="trophy-card-image">
        <img
          src={trophy.thumbnailPath}
          alt={trophy.name}
          loading="lazy"
        />
      </div>
      <div className="trophy-card-info">
        <h2 className="trophy-card-name">{trophy.name}</h2>
        <p className="trophy-card-description">{trophy.description}</p>
      </div>
    </Link>
  )
}
