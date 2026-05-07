import { z } from 'zod'

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(50, 'Máximo 50 caracteres').trim(),
  slug: z
    .string()
    .min(1, 'Slug requerido')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones')
    .trim(),
})

export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>
