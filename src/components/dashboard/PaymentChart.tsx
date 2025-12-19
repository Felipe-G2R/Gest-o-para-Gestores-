import { CreditCard, Banknote } from 'lucide-react'

interface PaymentChartProps {
  pixCount: number
  cardCount: number
}

export function PaymentChart({ pixCount, cardCount }: PaymentChartProps) {
  const total = pixCount + cardCount
  const pixPercent = total ? Math.round((pixCount / total) * 100) : 0
  const cardPercent = total ? Math.round((cardCount / total) * 100) : 0

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title text-base">Formas de Pagamento</h3>

        <div className="mt-4 space-y-4">
          {/* PIX */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-primary" />
                PIX
              </span>
              <span className="font-medium">
                {pixCount} ({pixPercent}%)
              </span>
            </div>
            <progress
              className="progress progress-primary"
              value={pixPercent}
              max="100"
            />
          </div>

          {/* Cartão */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-success" />
                Cartão
              </span>
              <span className="font-medium">
                {cardCount} ({cardPercent}%)
              </span>
            </div>
            <progress
              className="progress progress-success"
              value={cardPercent}
              max="100"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
