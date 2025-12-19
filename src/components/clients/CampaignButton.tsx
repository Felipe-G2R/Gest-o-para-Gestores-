import { ExternalLink } from 'lucide-react'

interface CampaignButtonProps {
  link: string | null
  size?: 'sm' | 'md' | 'lg'
}

export function CampaignButton({ link, size = 'md' }: CampaignButtonProps) {
  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-primary gap-2 ${sizeClass[size]}`}
      >
        <ExternalLink className="w-5 h-5" />
        Acessar Campanha
      </a>
    )
  }

  return (
    <button className={`btn btn-disabled gap-2 ${sizeClass[size]}`} disabled>
      <ExternalLink className="w-5 h-5" />
      Sem Link
    </button>
  )
}
