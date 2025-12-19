import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout'
import { useTasksStore } from '@/hooks/useTasksStore'
import { formatDate } from '@/utils/format'
import type { Task, TaskStatus, TaskPriority } from '@/types'
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Star,
  Calendar,
  Edit3,
  X,
} from 'lucide-react'

type TaskFormData = {
  title: string
  description: string
  dueDate: string
  priority: TaskPriority
  isUrgent: boolean
}

const emptyTask: TaskFormData = {
  title: '',
  description: '',
  dueDate: new Date().toISOString().split('T')[0],
  priority: 'normal',
  isUrgent: false,
}

export function TMIPage() {
  const { tasks, loading, fetchTasks, addTask, updateTask, updateTaskStatus, deleteTask } = useTasksStore()

  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState<TaskFormData>(emptyTask)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const openAddModal = () => {
    setEditingTask(null)
    setFormData(emptyTask)
    setShowModal(true)
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate.split('T')[0],
      priority: task.priority,
      isUrgent: task.isUrgent,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTask(null)
    setFormData(emptyTask)
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) return

    setSaving(true)

    if (editingTask) {
      // Editar tarefa existente
      await updateTask(editingTask.id, {
        title: formData.title,
        description: formData.description || null,
        dueDate: formData.dueDate,
        priority: formData.priority,
        isUrgent: formData.isUrgent,
      })
    } else {
      // Adicionar nova tarefa
      await addTask({
        title: formData.title,
        description: formData.description || null,
        dueDate: formData.dueDate,
        priority: formData.priority,
        isUrgent: formData.isUrgent,
      })
    }

    setSaving(false)
    closeModal()
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTaskStatus(taskId, status)
  }

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Deseja excluir esta tarefa?')) {
      await deleteTask(taskId)
    }
  }

  const statusConfig: Record<TaskStatus, { label: string; class: string; activeClass: string; icon: typeof CheckCircle2 }> = {
    done: { label: 'Fiz', class: 'btn-ghost text-success', activeClass: 'btn-success text-success-content', icon: CheckCircle2 },
    not_done: { label: 'Não Fiz', class: 'btn-ghost text-error', activeClass: 'btn-error text-error-content', icon: XCircle },
    pending: { label: 'A Fazer', class: 'btn-ghost text-warning', activeClass: 'btn-warning text-warning-content', icon: Clock },
  }

  const priorityConfig: Record<TaskPriority, { label: string; class: string }> = {
    urgent: { label: 'Urgente', class: 'text-error font-semibold' },
    important: { label: 'Importante', class: 'text-warning font-semibold' },
    normal: { label: 'Normal', class: 'text-base-content/60' },
  }

  // Separate urgent and normal tasks
  const urgentTasks = tasks.filter((t) => t.isUrgent || t.priority === 'urgent')
  const normalTasks = tasks.filter((t) => !t.isUrgent && t.priority !== 'urgent')

  const StatusButtons = ({ task }: { task: Task }) => (
    <div className="join">
      <button
        onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'done'); }}
        className={`join-item btn btn-sm ${task.status === 'done' ? statusConfig.done.activeClass : statusConfig.done.class}`}
        title="Fiz"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span className="hidden sm:inline ml-1">Fiz</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'not_done'); }}
        className={`join-item btn btn-sm ${task.status === 'not_done' ? statusConfig.not_done.activeClass : statusConfig.not_done.class}`}
        title="Não Fiz"
      >
        <XCircle className="w-4 h-4" />
        <span className="hidden sm:inline ml-1">Não Fiz</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'pending'); }}
        className={`join-item btn btn-sm ${task.status === 'pending' ? statusConfig.pending.activeClass : statusConfig.pending.class}`}
        title="A Fazer"
      >
        <Clock className="w-4 h-4" />
        <span className="hidden sm:inline ml-1">A Fazer</span>
      </button>
    </div>
  )

  const TaskRow = ({ task }: { task: Task }) => (
    <tr
      className="hover cursor-pointer transition-colors"
      onClick={() => openEditModal(task)}
    >
      <td className="font-mono text-sm">{formatDate(task.dueDate)}</td>
      <td>
        <div className="flex items-center gap-2">
          {task.isUrgent && <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />}
          {task.priority === 'important' && !task.isUrgent && <Star className="w-4 h-4 text-warning flex-shrink-0" />}
          <div className="min-w-0">
            <span className="font-medium block truncate">{task.title}</span>
            {task.description && (
              <p className="text-xs text-base-content/60 truncate">{task.description}</p>
            )}
          </div>
        </div>
      </td>
      <td>
        <span className={`text-sm ${priorityConfig[task.priority].class}`}>
          {priorityConfig[task.priority].label}
        </span>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <StatusButtons task={task} />
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1">
          <button
            onClick={() => openEditModal(task)}
            className="btn btn-sm btn-ghost text-info"
            title="Editar"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(task.id)}
            className="btn btn-sm btn-ghost text-error"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )

  const TableHeader = () => (
    <thead>
      <tr>
        <th className="w-28">Data</th>
        <th>Tarefa</th>
        <th className="w-24">Prioridade</th>
        <th className="w-52">Status</th>
        <th className="w-24">Ações</th>
      </tr>
    </thead>
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">TMI - Tarefa Mais Importante</h1>
            <p className="text-base-content/60">Gerencie suas tarefas diárias</p>
          </div>
          <button onClick={openAddModal} className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nova Tarefa
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* Urgent Tasks */}
            {urgentTasks.length > 0 && (
              <div className="card bg-error/5 border border-error/20">
                <div className="card-body">
                  <h2 className="card-title text-error gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Tarefas Urgentes ({urgentTasks.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <TableHeader />
                      <tbody>
                        {urgentTasks.map((task) => (
                          <TaskRow key={task.id} task={task} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Normal Tasks */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title gap-2">
                  <Calendar className="w-5 h-5" />
                  Todas as Tarefas ({normalTasks.length})
                </h2>
                {normalTasks.length === 0 && urgentTasks.length === 0 ? (
                  <div className="text-center py-10">
                    <Clock className="w-12 h-12 mx-auto text-base-content/20 mb-4" />
                    <p className="text-base-content/60">Nenhuma tarefa cadastrada</p>
                    <button
                      onClick={openAddModal}
                      className="btn btn-primary btn-sm mt-4"
                    >
                      Adicionar Tarefa
                    </button>
                  </div>
                ) : normalTasks.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-base-content/60">Todas as tarefas são urgentes</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <TableHeader />
                      <tbody>
                        {normalTasks.map((task) => (
                          <TaskRow key={task.id} task={task} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Add/Edit Task Modal */}
        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <button
                onClick={closeModal}
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-bold text-lg mb-4">
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h3>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Título *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Revisar relatório mensal"
                    className="input input-bordered"
                    autoFocus
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Descrição</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes da tarefa..."
                    className="textarea textarea-bordered"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Data *</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="input input-bordered"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Prioridade</span>
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                      className="select select-bordered"
                    >
                      <option value="normal">Normal</option>
                      <option value="important">Importante</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isUrgent}
                      onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                      className="checkbox checkbox-error"
                    />
                    <span className="label-text font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-error" />
                      Marcar como Tarefa Urgente
                    </span>
                  </label>
                </div>
              </div>

              <div className="modal-action">
                <button onClick={closeModal} className="btn btn-ghost">
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.title.trim() || saving}
                  className="btn btn-primary"
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : editingTask ? (
                    'Salvar'
                  ) : (
                    'Adicionar'
                  )}
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={closeModal}></div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
