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
} from 'lucide-react'

export function TMIPage() {
  const { tasks, loading, fetchTasks, addTask, updateTaskStatus, deleteTask } = useTasksStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'normal' as TaskPriority,
    isUrgent: false,
  })

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return

    await addTask({
      title: newTask.title,
      description: newTask.description || null,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      isUrgent: newTask.isUrgent,
    })

    setNewTask({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'normal',
      isUrgent: false,
    })
    setShowAddModal(false)
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTaskStatus(taskId, status)
  }

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Deseja excluir esta tarefa?')) {
      await deleteTask(taskId)
    }
  }

  const statusConfig: Record<TaskStatus, { label: string; class: string; icon: typeof CheckCircle2 }> = {
    done: { label: 'Fiz', class: 'badge-success', icon: CheckCircle2 },
    not_done: { label: 'Não Fiz', class: 'badge-error', icon: XCircle },
    pending: { label: 'A Fazer', class: 'badge-warning', icon: Clock },
  }

  const priorityConfig: Record<TaskPriority, { label: string; class: string }> = {
    urgent: { label: 'Urgente', class: 'text-error' },
    important: { label: 'Importante', class: 'text-warning' },
    normal: { label: 'Normal', class: 'text-base-content/60' },
  }

  // Separate urgent and normal tasks
  const urgentTasks = tasks.filter((t) => t.isUrgent || t.priority === 'urgent')
  const normalTasks = tasks.filter((t) => !t.isUrgent && t.priority !== 'urgent')

  const TaskRow = ({ task }: { task: Task }) => (
    <tr className="hover">
      <td className="font-mono text-sm">{formatDate(task.dueDate)}</td>
      <td>
        <div className="flex items-center gap-2">
          {task.isUrgent && <AlertTriangle className="w-4 h-4 text-error" />}
          {task.priority === 'important' && <Star className="w-4 h-4 text-warning" />}
          <span className="font-medium">{task.title}</span>
        </div>
        {task.description && (
          <p className="text-xs text-base-content/60 mt-1">{task.description}</p>
        )}
      </td>
      <td>
        <span className={`text-sm font-medium ${priorityConfig[task.priority].class}`}>
          {priorityConfig[task.priority].label}
        </span>
      </td>
      <td>
        <span className={`badge ${statusConfig[task.status].class} gap-1`}>
          {(() => {
            const Icon = statusConfig[task.status].icon
            return <Icon className="w-3 h-3" />
          })()}
          {statusConfig[task.status].label}
        </span>
      </td>
      <td>
        <div className="flex gap-1">
          <button
            onClick={() => handleStatusChange(task.id, 'done')}
            className={`btn btn-xs ${task.status === 'done' ? 'btn-success' : 'btn-ghost'}`}
            title="Fiz"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleStatusChange(task.id, 'not_done')}
            className={`btn btn-xs ${task.status === 'not_done' ? 'btn-error' : 'btn-ghost'}`}
            title="Não Fiz"
          >
            <XCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleStatusChange(task.id, 'pending')}
            className={`btn btn-xs ${task.status === 'pending' ? 'btn-warning' : 'btn-ghost'}`}
            title="A Fazer"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(task.id)}
            className="btn btn-xs btn-ghost text-error"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
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
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary gap-2">
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
                    Tarefas Urgentes
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th className="w-32">Data</th>
                          <th>Tarefa</th>
                          <th className="w-28">Prioridade</th>
                          <th className="w-28">Status</th>
                          <th className="w-40">Ações</th>
                        </tr>
                      </thead>
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
                  Todas as Tarefas
                </h2>
                {normalTasks.length === 0 && urgentTasks.length === 0 ? (
                  <div className="text-center py-10">
                    <Clock className="w-12 h-12 mx-auto text-base-content/20 mb-4" />
                    <p className="text-base-content/60">Nenhuma tarefa cadastrada</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="btn btn-primary btn-sm mt-4"
                    >
                      Adicionar Tarefa
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th className="w-32">Data</th>
                          <th>Tarefa</th>
                          <th className="w-28">Prioridade</th>
                          <th className="w-28">Status</th>
                          <th className="w-40">Ações</th>
                        </tr>
                      </thead>
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

        {/* Add Task Modal */}
        {showAddModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Nova Tarefa</h3>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Título *</span>
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Ex: Revisar relatório mensal"
                    className="input input-bordered"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Descrição</span>
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Detalhes da tarefa..."
                    className="textarea textarea-bordered"
                    rows={2}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Data *</span>
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="input input-bordered"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Prioridade</span>
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                    className="select select-bordered"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Importante</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      checked={newTask.isUrgent}
                      onChange={(e) => setNewTask({ ...newTask, isUrgent: e.target.checked })}
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
                <button onClick={() => setShowAddModal(false)} className="btn btn-ghost">
                  Cancelar
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTask.title.trim()}
                  className="btn btn-primary"
                >
                  Adicionar
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowAddModal(false)}></div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
