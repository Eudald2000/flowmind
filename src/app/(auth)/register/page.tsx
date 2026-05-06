import Link from 'next/link'
import { RegisterForm } from './register-form'
import { BrainCircuit, CheckCircle2 } from 'lucide-react'

const FEATURES = [
  'Gestión de proyectos y tareas con IA integrada',
  'Agente conversacional que actúa sobre tus datos',
  'Búsqueda semántica en documentos con RAG',
]

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#18181B] px-12 py-10">
        <div className="flex items-center gap-2.5">
          <BrainCircuit className="h-6 w-6 text-white" />
          <span className="text-lg font-semibold text-white tracking-tight">FlowMind</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-medium leading-snug text-white">
              Todo lo que necesitas para gestionar proyectos con IA
            </h2>
            <p className="text-sm text-[#71717A]">
              Empieza gratis. Sin tarjeta de crédito.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
                <span className="text-sm text-[#A1A1AA]">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[#52525B]">
          © {new Date().getFullYear()} FlowMind. Todos los derechos reservados.
        </p>
      </div>

      {/* Right — form panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-[#FAFAFA] px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <BrainCircuit className="h-5 w-5 text-[#18181B]" />
            <span className="text-base font-semibold text-[#18181B] tracking-tight">FlowMind</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-[#09090B] tracking-tight">
              Crea tu cuenta
            </h1>
            <p className="text-sm text-[#71717A]">
              Empieza a gestionar proyectos con IA hoy mismo
            </p>
          </div>

          <RegisterForm />

          <p className="text-center text-sm text-[#71717A]">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="font-medium text-[#09090B] underline underline-offset-4 hover:text-[#18181B]"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
