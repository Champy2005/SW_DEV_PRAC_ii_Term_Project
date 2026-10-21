'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import { ArrowIcon } from './icons';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const registering = mode === 'register';
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true); setError('');
    const body = { email: String(form.get('email')).trim(), password: String(form.get('password')), ...(registering ? { name: String(form.get('name')).trim(), tel: String(form.get('tel')).trim(), role: String(form.get('role')) } : {}) };
    try {
      await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(body) });
      router.push('/registrations'); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'); setPending(false); }
  }
  return <form className="stack-form" onSubmit={submit} aria-label={registering ? 'Create an account' : 'Log in'}>
    {registering && <div className="field"><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" placeholder="How should we call you?" required maxLength={80}/></div>}
    <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254}/></div>
    {registering && <div className="field"><label htmlFor="tel">Phone number</label><input id="tel" name="tel" type="tel" autoComplete="tel" placeholder="Your contact number" required maxLength={30}/></div>}
    {registering && <div className="field"><label htmlFor="role">Account role</label><select id="role" name="role" defaultValue="member"><option value="member">Member — register for workshops</option><option value="admin">Admin — manage workshops</option></select><p className="field-hint">Both roles are available for this classroom demo.</p></div>}
    <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} required minLength={registering ? 8 : undefined} maxLength={128} placeholder={registering ? 'At least 8 characters' : 'Your password'} aria-describedby={registering ? 'password-hint' : undefined}/>{registering && <p className="field-hint" id="password-hint">Use at least 8 characters.</p>}</div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <button className="button button-full" disabled={pending} type="submit">{pending ? registering ? 'Creating your account…' : 'Logging in…' : registering ? 'Create account' : 'Welcome back'}{!pending && <ArrowIcon/>}</button>
    <p className="form-switch">{registering ? 'Already part of the table?' : 'New around here?'} <Link href={registering ? '/login' : '/register'}>{registering ? 'Log in' : 'Create an account'}</Link></p>
  </form>;
}
