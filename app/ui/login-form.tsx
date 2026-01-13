'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input type="email" name="email" id="email" placeholder="nombre@ejemplo.com" required />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input type="password" name="password" id="password" required minLength={6} />
      </div>
      <div className="flex flex-col gap-2">
        <LoginButton />
      </div>
      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} type="submit" className="w-full">
      {pending ? 'Iniciando...' : 'Iniciar Sesión'}
    </Button>
  );
}
