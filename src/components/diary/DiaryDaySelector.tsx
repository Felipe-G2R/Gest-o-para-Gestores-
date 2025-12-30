import { useState, useEffect, useRef } from 'react'
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface DiaryDaySelectorProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  entriesCount: Record<string, number>
  onMonthChange?: (month: number, year: number) => void
}

export function DiaryDaySelector({
  selectedDate,
  onSelectDate,
  entriesCount,
  onMonthChange
}: DiaryDaySelectorProps) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(new Date())
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLButtonElement>(null)

  // Gera todos os dias do mês atual em visualização
  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const handlePrevMonth = () => {
    const newMonth = subMonths(viewMonth, 1)
    setViewMonth(newMonth)
    onMonthChange?.(newMonth.getMonth(), newMonth.getFullYear())
  }

  const handleNextMonth = () => {
    const newMonth = addMonths(viewMonth, 1)
    setViewMonth(newMonth)
    onMonthChange?.(newMonth.getMonth(), newMonth.getFullYear())
  }

  const handleGoToToday = () => {
    const now = new Date()
    setViewMonth(now)
    onSelectDate(now)
    onMonthChange?.(now.getMonth(), now.getFullYear())
  }

  // Scroll para o dia atual ou selecionado quando o mês muda
  useEffect(() => {
    if (scrollRef.current && isSameMonth(viewMonth, today)) {
      setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }, 100)
    }
  }, [viewMonth])

  const isCurrentMonth = isSameMonth(viewMonth, today)
  const isFutureMonth = viewMonth > today

  return (
    <div className="space-y-3">
      {/* Header com navegação de mês */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="btn btn-ghost btn-sm btn-circle"
            title="Mês anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold min-w-[140px] text-center capitalize">
            {format(viewMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            onClick={handleNextMonth}
            disabled={isFutureMonth}
            className="btn btn-ghost btn-sm btn-circle disabled:opacity-30"
            title="Próximo mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        {!isCurrentMonth && (
          <button
            onClick={handleGoToToday}
            className="btn btn-ghost btn-sm gap-1 text-success"
          >
            <Calendar className="w-4 h-4" />
            Ir para Hoje
          </button>
        )}
      </div>

      {/* Dias do mês */}
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const isSelected = isSameDay(day, selectedDate)
          const isToday = isSameDay(day, today)
          const count = entriesCount[dateKey] || 0
          const isFuture = day > today

          return (
            <button
              key={dateKey}
              ref={isToday ? todayRef : undefined}
              onClick={() => !isFuture && onSelectDate(day)}
              disabled={isFuture}
              className={`flex flex-col items-center min-w-[70px] p-3 rounded-lg transition-all border-2 ${
                isToday
                  ? isSelected
                    ? 'bg-success text-success-content border-success'
                    : 'bg-success/20 border-success text-success hover:bg-success/30'
                  : isSelected
                    ? 'bg-primary text-primary-content border-primary'
                    : isFuture
                      ? 'bg-base-200 opacity-40 cursor-not-allowed border-transparent'
                      : 'bg-base-200 hover:bg-base-300 border-transparent'
              }`}
            >
              <span className="text-2xl font-bold">{format(day, 'd')}</span>
              <span className="text-xs uppercase">
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              {isToday && (
                <span className={`text-[10px] mt-1 font-bold ${isSelected ? '' : 'text-success'}`}>
                  HOJE
                </span>
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
    </div>
  )
}
