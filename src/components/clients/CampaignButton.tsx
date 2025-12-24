import { ExternalLink, Rocket } from 'lucide-react'

interface CampaignButtonProps {
  link: string | null
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'optimize'
}

export function CampaignButton({ link, size = 'md', variant = 'default' }: CampaignButtonProps) {
  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  if (variant === 'optimize' && link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-primary gap-2 ${sizeClass[size]}`}
      >
        <Rocket className={iconSize[size]} />
        Otimizando Campanha
      </a>
    )
  }

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-primary gap-2 ${sizeClass[size]}`}
      >
        <ExternalLink className={iconSize[size]} />
        Acessar Campanha
      </a>
    )
  }

  return (
    <button className={`btn btn-disabled gap-2 ${sizeClass[size]}`} disabled>
      <ExternalLink className={iconSize[size]} />
      Sem Link
    </button>
  )
}
