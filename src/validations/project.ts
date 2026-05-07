import { z } from 'zod'

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres').trim(),
  description: z.string().max(500, 'Máximo 500 caracteres').trim().optional(),
  workspace_id: z.string().uuid(),
})

export const UpdateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
  is_active: z.boolean().optional(),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>
