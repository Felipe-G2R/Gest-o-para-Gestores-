import { useState, useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'

interface CalendarViewProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  entriesCount: Record<string, number>
}

export function CalendarView({
  selectedDate,
  onSelectDate,
  entriesCount
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const today = new Date()

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => {
    setCurrentMonth(new Date())
    onSelectDate(new Date())
  }

  // Gera os dias do calendário
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days: Date[] = []
    let day = startDate
    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentMonth])

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevMonth}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold min-w-[200px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button
              onClick={goToNextMonth}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button onClick={goToToday} className="btn btn-outline btn-sm">
            Hoje
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-base-content/60 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, today)
            const count = entriesCount[dateKey] || 0

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(day)}
                className={`
                  relative flex flex-col items-center justify-center
                  min-h-[70px] rounded-lg transition-all
                  ${isCurrentMonth ? '' : 'opacity-30'}
                  ${isSelected ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}
                  ${isToday && !isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                `}
              >
                <span className={`text-lg ${isToday ? 'font-bold' : ''}`}>
                  {format(day, 'd')}
                </span>

                {count > 0 && (
                  <div
                    className={`
                      flex items-center gap-0.5 mt-1 text-xs
                      ${isSelected ? 'text-primary-content/80' : 'text-primary'}
                    `}
                  >
                    <FileText className="w-3 h-3" />
                    <span>{count}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
