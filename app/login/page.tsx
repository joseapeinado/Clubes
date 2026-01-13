import LoginForm from '@/app/ui/login-form';
import { Metadata } from 'next';
import { auth } from "@/auth"
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Inciar Sesión',
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <h1 className="text-2xl font-bold">Clubes App</h1>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Iniciar Sesión</h2>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
