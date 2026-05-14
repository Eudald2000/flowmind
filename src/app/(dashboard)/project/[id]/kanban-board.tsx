'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { EditTaskSheet } from './edit-task-sheet'
import { updateTaskStatus } from './actions'

const COLUMNS = [
  { status: 'todo',        label: 'Pendiente',   color: 'text-[#71717A]',   dot: 'bg-[#D4D4D8]'  },
  { status: 'in_progress', label: 'En progreso', color: 'text-blue-700',    dot: 'bg-blue-400'   },
  { status: 'done',        label: 'Hecho',       color: 'text-emerald-700', dot: 'bg-emerald-400' },
  { status: 'cancelled',   label: 'Cancelado',   color: 'text-red-500',     dot: 'bg-red-400'    },
]

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente',
}

const PRIORITY_COLORS: Record<string, string> = {
  low:    'bg-[#F4F4F5] text-[#71717A]',
  medium: 'bg-blue-50 text-blue-700',
  high:   'bg-amber-50 text-amber-700',
  urgent: 'bg-red-50 text-red-600',
}

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
}

function TaskBadges({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge className={`text-[10px] font-medium border-0 ${PRIORITY_COLORS[task.priority]}`}>
        {PRIORITY_LABELS[task.priority]}
      </Badge>
      {task.due_date && (
        <span className="text-[10px] text-[#A1A1AA]">
          {new Date(task.due_date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        </span>
      )}
    </div>
  )
}

function DraggableCard({ task, projectId }: { task: Task; projectId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.35 : 1 }}
      {...attributes}
      className="group flex flex-col gap-2 rounded-xl border border-[#E4E4E7] bg-white p-3 select-none"
    >
      <div className="flex items-start gap-1.5">
        <div
          {...listeners}
          className="mt-0.5 shrink-0 touch-none cursor-grab active:cursor-grabbing text-[#D4D4D8] hover:text-[#A1A1AA] transition-colors"
        >
          <GripVertical className="h-3.5 w-3.5 pointer-events-none" />
        </div>
        <p className="flex-1 text-sm text-[#09090B] leading-snug line-clamp-3">{task.title}</p>
        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <EditTaskSheet task={{ ...task, project_id: projectId }} />
        </div>
      </div>
      <TaskBadges task={task} />
    </div>
  )
}

function DroppableColumn({
  col,
  tasks,
  projectId,
}: {
  col: (typeof COLUMNS)[number]
  tasks: Task[]
  projectId: string
}) {
  const { isOver, setNodeRef } = useDroppable({ id: col.status })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 pb-2 border-b border-[#E4E4E7]">
        <span className={`h-2 w-2 rounded-full ${col.dot}`} />
        <span className={`text-xs font-medium ${col.color}`}>{col.label}</span>
        <span className="ml-auto text-xs text-[#A1A1AA]">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 min-h-[80px] rounded-xl p-1 transition-colors ${
          isOver ? 'bg-blue-50/60 ring-2 ring-blue-200 ring-inset' : ''
        }`}
      >
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} projectId={projectId} />
        ))}
        {tasks.length === 0 && !isOver && (
          <div className="rounded-xl border border-dashed border-[#E4E4E7] py-8 text-center">
            <p className="text-xs text-[#A1A1AA]">Sin tareas</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface Props {
  tasks: Task[]
  projectId: string
}

export function KanbanBoard({ tasks: initialTasks, projectId }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [, startTransition] = useTransition()

  // Sync when server sends fresh data after revalidation
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveTask(tasks.find((t) => t.id === active.id) ?? null)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null)
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as string
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))

    startTransition(async () => {
      const result = await updateTaskStatus(taskId, newStatus, projectId)
      if (result?.error) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t)))
        toast.error('Error al mover la tarea')
      }
    })
  }

  return (
    <DndContext
      id="kanban"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-4 gap-4 min-w-[680px]">
          {COLUMNS.map((col) => (
            <DroppableColumn
              key={col.status}
              col={col}
              tasks={tasks.filter((t) => t.status === col.status)}
              projectId={projectId}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeTask && (
          <div className="flex flex-col gap-2 rounded-xl border border-[#E4E4E7] bg-white p-3 shadow-xl rotate-1 cursor-grabbing">
            <p className="text-sm text-[#09090B] leading-snug line-clamp-3">{activeTask.title}</p>
            <TaskBadges task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
