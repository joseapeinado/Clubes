'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', { ...Object.fromEntries(formData), redirectTo: '/dashboard' });
  } catch (error) {
    if (error instanceof AuthError) {
      console.error('AuthError type:', error.type, 'Original error:', error.cause || error);
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales inválidas.';
        default:
          return 'Algo salió mal. Por favor, revisa los logs del servidor.';
      }
    }
    throw error;
  }
}
