'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { authService } from '@/lib/services/auth.service';
import type { RegisterInput } from '@/lib/shared';

export async function register(formData: FormData) {
  const input: RegisterInput = {
    company_name: formData.get('company_name') as string,
    primary_contact_name: formData.get('primary_contact_name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    phone: formData.get('phone') as string,
    vkn: (formData.get('vkn') as string) || undefined,
    sector: (formData.get('sector') as string) || undefined,
    primary_contact_title: (formData.get('primary_contact_title') as string) || undefined,
    billing_address: (formData.get('billing_address') as string) || undefined,
    billing_district: (formData.get('billing_district') as string) || undefined,
    kvkk_accepted: (formData.get('kvkk_accepted') === 'true') as true,
  };

  return authService.register(input);
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return { error: error?.message ?? 'E-posta adresi veya sifre yanlis.' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}/reset-password`,
  });

  if (error) {
    console.warn('Forgot password error:', error.message);
  }

  return {
    message: 'Sifre sifirlama baglantisi e-posta adresinize gonderildi (e-posta kayitliysa).',
  };
}
