import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { MainLayout } from '@/components/layout'
import { CalendarView, CalendarDayPanel } from '@/components/calendar'
import { DiaryEditorModal } from '@/components/diary'
import { useDiaryStore } from '@/hooks/useDiaryStore'
import type { DiaryEntry } from '@/types'

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    loading,
    fetchEntries,
    getEntriesByDate,
    getEntriesCountByDate,
    createEntry,
    updateEntry
  } = useDiaryStore()

  useEffect(() => {
    // Carrega entradas de 3 meses (anterior, atual, próximo)
    const currentMonth = new Date()
    const months = [
      { month: currentMonth.getMonth() - 1, year: currentMonth.getFullYear() },
      { month: currentMonth.getMonth(), year: currentMonth.getFullYear() },
      { month: currentMonth.getMonth() + 1, year: currentMonth.getFullYear() }
    ]

    // Ajusta para anos diferentes
    months.forEach(({ month, year }) => {
      let adjustedMonth = month
      let adjustedYear = year
      if (month < 0) {
        adjustedMonth = 11
        adjustedYear = year - 1
      } else if (month > 11) {
        adjustedMonth = 0
        adjustedYear = year + 1
      }
      fetchEntries(adjustedMonth, adjustedYear)
    })
  }, [fetchEntries])

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const dayEntries = getEntriesByDate(selectedDateStr)
  const entriesCount = getEntriesCountByDate()

  const handleNewEntry = () => {
    setEditingEntry(null)
    setIsEditorOpen(true)
  }

  const handleViewEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry)
    setIsEditorOpen(true)
  }

  const handleSaveEntry = async (title: string, content: string) => {
    setSaving(true)
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, title, content)
      } else {
        const newEntry = await createEntry(selectedDateStr, title, content)
        if (newEntry) {
          setEditingEntry(newEntry)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingEntry(null)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Calendário</h1>
            <p className="text-base-content/60">Visualize suas entradas do diário</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendário */}
            <div className="lg:col-span-2">
              <CalendarView
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                entriesCount={entriesCount}
              />
            </div>

            {/* Painel do dia */}
            <div className="lg:col-span-1">
              <CalendarDayPanel
                date={selectedDate}
                entries={dayEntries}
                onNewEntry={handleNewEntry}
                onViewEntry={handleViewEntry}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal de edição */}
      <DiaryEditorModal
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        entry={editingEntry}
        date={selectedDate}
        onSave={handleSaveEntry}
        saving={saving}
      />
    </MainLayout>
  )
}
