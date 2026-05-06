import Link from 'next/link'
import { LoginForm } from './login-form'
import { BrainCircuit } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <div className="flex min-h-svh">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#18181B] px-12 py-10">
        <div className="flex items-center gap-2.5">
          <BrainCircuit className="h-6 w-6 text-white" />
          <span className="text-lg font-semibold text-white tracking-tight">FlowMind</span>
        </div>

        <div className="space-y-4">
          <blockquote className="space-y-3">
            <p className="text-2xl font-medium leading-snug text-white">
              "Gestiona proyectos con la velocidad del pensamiento. Tu equipo y tu IA, en perfecta sincronía."
            </p>
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#3F3F46] flex items-center justify-center">
              <span className="text-xs font-medium text-white">EB</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Eudald Bosch</p>
              <p className="text-xs text-[#71717A]">Creador de FlowMind</p>
            </div>
          </div>
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
              Bienvenido de nuevo
            </h1>
            <p className="text-sm text-[#71717A]">
              Inicia sesión para continuar en tu workspace
            </p>
          </div>

          <LoginForm searchParams={searchParams} />

          <p className="text-center text-sm text-[#71717A]">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="font-medium text-[#09090B] underline underline-offset-4 hover:text-[#18181B]"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
