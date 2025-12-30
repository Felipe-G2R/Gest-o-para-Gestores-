import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, BookOpen, Calendar } from 'lucide-react'
import { MainLayout } from '@/components/layout'
import { DiaryEntryCard, DiaryDaySelector, DiaryEditorModal } from '@/components/diary'
import { useDiaryStore } from '@/hooks/useDiaryStore'
import type { DiaryEntry } from '@/types'

export function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    loading,
    fetchEntries,
    getEntriesByDate,
    getEntriesCountByDate,
    createEntry,
    updateEntry,
    deleteEntry
  } = useDiaryStore()

  // Carrega entradas quando o mês/ano muda
  useEffect(() => {
    fetchEntries(currentMonth, currentYear)
  }, [currentMonth, currentYear, fetchEntries])

  // Callback para quando o mês mudar no seletor
  const handleMonthChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month)
    setCurrentYear(year)
  }, [])

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const dayEntries = getEntriesByDate(selectedDateStr)
  const entriesCount = getEntriesCountByDate()

  const handleNewEntry = () => {
    setEditingEntry(null)
    setIsEditorOpen(true)
  }

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry)
    setIsEditorOpen(true)
  }

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Deseja excluir esta entrada?')) {
      await deleteEntry(id)
    }
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

  const dateFormatted = format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })
  const isToday = format(new Date(), 'yyyy-MM-dd') === selectedDateStr

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Diário de Bordo</h1>
              <p className="text-base-content/60">Registre suas atividades diárias</p>
            </div>
          </div>

          <button onClick={handleNewEntry} className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nova Entrada
          </button>
        </div>

        {/* Seletor de dias */}
        <div className="card bg-base-100 shadow">
          <div className="card-body py-4">
            <DiaryDaySelector
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              entriesCount={entriesCount}
              onMonthChange={handleMonthChange}
            />
          </div>
        </div>

        {/* Dia selecionado */}
        <div className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-semibold">{dateFormatted}</span>
          {isToday && (
            <span className="badge badge-primary badge-sm">Hoje</span>
          )}
        </div>

        {/* Lista de entradas */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : dayEntries.length > 0 ? (
          <div className="space-y-4">
            {dayEntries.map((entry) => (
              <DiaryEntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => handleEditEntry(entry)}
                onDelete={() => handleDeleteEntry(entry.id)}
              />
            ))}
          </div>
        ) : (
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center py-12">
              <BookOpen className="w-16 h-16 text-base-content/20 mb-4" />
              <h3 className="text-lg font-semibold text-base-content/60">
                Nenhuma entrada neste dia
              </h3>
              <p className="text-base-content/40 mb-4">
                Comece a registrar suas atividades
              </p>
              <button onClick={handleNewEntry} className="btn btn-primary gap-2">
                <Plus className="w-5 h-5" />
                Criar Primeira Entrada
              </button>
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
