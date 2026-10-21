'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { ACTIVE_REGISTRATION_LIMIT, isUpcoming } from '@/lib/rules';
import type { Registration, User, Workshop } from '@/lib/types';
import { ArrowIcon } from './icons';

interface RegistrationButtonProps {
  workshop: Workshop;
  user: User | null;
  /** The signed-in member's registration for this workshop, if any. */
  existing?: Registration | null;
  /** The signed-in member's active registration count (see countActiveRegistrations). */
  activeCount?: number;
}

/**
 * Guides members before they submit. The API remains the authority: a forced
 * request is still rejected and its error is shown here.
 */
export function RegistrationButton({ workshop, user, existing = null, activeCount = 0 }: RegistrationButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function register() {
    setPending(true); setError('');
    try {
      const created = await api<Registration>('/registrations', { method: 'POST', body: JSON.stringify({ workshop: workshop._id }) });
      router.push(`/registrations?registered=${created._id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register. Please try again.');
      setPending(false);
    }
  }

  if (user?.role === 'admin') {
    return <div className="notice">Members register for workshops. You can manage all member registrations from your dashboard.<Link href="/registrations">Manage registrations <span aria-hidden="true">↗</span></Link></div>;
  }
  if (!workshop.isActive || !isUpcoming(workshop.workshopDate)) {
    return <div className="notice">{!workshop.isActive ? 'This workshop is currently unavailable.' : 'Registration has closed for this workshop.'}<Link href="/">Explore other workshops <span aria-hidden="true">↗</span></Link></div>;
  }
  if (existing) {
    return <div className="notice" role="status">You’re registered for this workshop. Reference ID <code>{existing._id}</code><Link href="/registrations">View my registrations <span aria-hidden="true">↗</span></Link></div>;
  }
  if (user && activeCount >= ACTIVE_REGISTRATION_LIMIT) {
    return <div className="notice" role="status">You already have {ACTIVE_REGISTRATION_LIMIT} of {ACTIVE_REGISTRATION_LIMIT} active workshop registrations. Cancel or change one to register here.<Link href="/registrations">Manage my registrations <span aria-hidden="true">↗</span></Link></div>;
  }
  return (
    <div className="registration-action">
      {error && <p className="form-error" role="alert">{error}</p>}
      {user
        ? <button className="button button-full" type="button" disabled={pending} onClick={register}>{pending ? 'Reserving your place…' : 'Register for this workshop'}{!pending && <ArrowIcon/>}</button>
        : <Link className="button button-full" href="/login">Log in to register <ArrowIcon/></Link>}
      <p className="fine-print">{user ? `You have ${activeCount} of ${ACTIVE_REGISTRATION_LIMIT} active workshop registrations.` : `Members can hold up to ${ACTIVE_REGISTRATION_LIMIT} active workshop registrations.`} Manage or cancel them from your registrations.</p>
    </div>
  );
}
