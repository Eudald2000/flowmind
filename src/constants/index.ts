export const APP_NAME = 'FlowMind'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const TASK_STATUSES = ['todo', 'in_progress', 'done', 'cancelled'] as const
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export const WORKSPACE_ROLES = ['owner', 'admin', 'member'] as const

export type TaskStatus = typeof TASK_STATUSES[number]
export type TaskPriority = typeof TASK_PRIORITIES[number]
export type WorkspaceRole = typeof WORKSPACE_ROLES[number]
