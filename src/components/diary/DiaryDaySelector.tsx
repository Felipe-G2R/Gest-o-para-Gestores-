import { format, subDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DiaryDaySelectorProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  entriesCount: Record<string, number>
}

export function DiaryDaySelector({
  selectedDate,
  onSelectDate,
  entriesCount
}: DiaryDaySelectorProps) {
  const today = new Date()

  // Gera os últimos 7 dias
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i))

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {days.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd')
        const isSelected = isSameDay(day, selectedDate)
        const isToday = isSameDay(day, today)
        const count = entriesCount[dateKey] || 0

        return (
          <button
            key={dateKey}
            onClick={() => onSelectDate(day)}
            className={`flex flex-col items-center min-w-[70px] p-3 rounded-lg transition-all ${
              isSelected
                ? 'bg-primary text-primary-content'
                : 'bg-base-200 hover:bg-base-300'
            }`}
          >
            <span className="text-2xl font-bold">{format(day, 'd')}</span>
            <span className="text-xs uppercase">
              {format(day, 'MMM', { locale: ptBR })}
            </span>
            {isToday && !isSelected && (
              <span className="text-[10px] mt-1 text-primary font-semibold">
                HOJE
              </span>
            )}
            {isToday && isSelected && (
              <span className="text-[10px] mt-1 font-semibold">HOJE</span>
            )}
            {!isToday && count > 0 && (
              <span
                className={`text-[10px] mt-1 px-1.5 rounded-full ${
                  isSelected
                    ? 'bg-primary-content/20 text-primary-content'
                    : 'bg-primary/20 text-primary'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
