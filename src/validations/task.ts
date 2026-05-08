import { z } from 'zod'
import { TASK_STATUSES, TASK_PRIORITIES } from '@/constants'

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(5000).trim().optional(),
  status: z.enum(TASK_STATUSES).default('todo'),
  priority: z.enum(TASK_PRIORITIES).default('medium'),
  assignee_id: z.string().uuid().optional(),
  due_date: z.string().date().optional(),
  project_id: z.string().uuid(),
})

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  id: z.string().uuid(),
})

export const DeleteTaskSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  confirmed: z.literal(true),
})

export const GetTasksSchema = z.object({
  project_id: z.string().uuid(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assignee_id: z.string().uuid().optional(),
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>
export type DeleteTaskInput = z.infer<typeof DeleteTaskSchema>
export type GetTasksInput = z.infer<typeof GetTasksSchema>
