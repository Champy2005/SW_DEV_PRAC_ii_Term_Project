'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SubmitEvent } from 'react';
import { api } from '@/lib/api';
import type { AuthInput } from '@/lib/types';
import { ArrowIcon } from './icons';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const registering = mode === 'register';
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const body: AuthInput = {
      email: String(form.get('email') ?? '').trim(),
      password: String(form.get('password') ?? ''),
    };
    setError('');

    if (registering) {
      const name = String(form.get('name') ?? '').trim();
      const tel = String(form.get('tel') ?? '').trim();
      const role = form.get('role');

      // Native required controls reject empty strings; trim also rejects spaces.
      if (!name) {
        setError('Please enter your name.');
        return;
      }
      if (!tel) {
        setError('Please enter your phone number.');
        return;
      }
      if (role !== 'member' && role !== 'admin') {
        setError('Please choose a valid account role.');
        return;
      }

      body.name = name;
      body.tel = tel;
      body.role = role;
    }

    setPending(true);
    try {
      await api(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      router.push('/registrations');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPending(false);
    }
  }

  const submitLabel = pending
    ? (registering ? 'Creating your account…' : 'Logging in…')
    : (registering ? 'Create account' : 'Welcome back');

  return (
    <form
      className="stack-form"
      onSubmit={submit}
      aria-label={registering ? 'Create an account' : 'Log in'}
      aria-busy={pending}
    >
      {registering && (
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="What should we call you?"
            required
            maxLength={80}
          />
        </div>
      )}

      <div className="field">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          maxLength={254}
        />
      </div>

      {registering && (
        <>
          <div className="field">
            <label htmlFor="tel">Phone number</label>
            <input
              id="tel"
              name="tel"
              type="tel"
              autoComplete="tel"
              placeholder="Your contact number"
              required
              maxLength={30}
            />
          </div>

          <div className="field">
            <label htmlFor="role">Account role</label>
            <select id="role" name="role" defaultValue="member">
              <option value="member">Member — register for workshops</option>
              <option value="admin">Admin — manage workshops</option>
            </select>
            <p className="field-hint">Both roles are available for this classroom demo.</p>
          </div>
        </>
      )}

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={registering ? 'new-password' : 'current-password'}
          required
          minLength={registering ? 8 : undefined}
          maxLength={128}
          placeholder={registering ? 'At least 8 characters' : 'Your password'}
          aria-describedby={registering ? 'password-hint' : undefined}
        />
        {registering && (
          <p className="field-hint" id="password-hint">Use at least 8 characters.</p>
        )}
      </div>

      {error && <div className="form-error" role="alert">{error}</div>}

      <button className="button button-full" disabled={pending} type="submit">
        {submitLabel}
        {!pending && <ArrowIcon />}
      </button>

      <p className="form-switch">
        {registering ? 'Already part of the table?' : 'New around here?'}{' '}
        <Link href={registering ? '/login' : '/register'}>
          {registering ? 'Log in' : 'Create an account'}
        </Link>
      </p>
    </form>
  );
}
