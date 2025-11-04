
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const username = formData.get('username');
  const password =formData.get('password');

  
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    
    const cookieStore = await cookies();
    cookieStore.set('auth-session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, 
      path: '/',
    });
    
    
    return redirect('/admin');
  }

  
  return 'Neplatné uživatelské jméno nebo heslo.';
}