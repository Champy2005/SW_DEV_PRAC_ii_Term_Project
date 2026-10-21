'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { isUpcoming } from '@/lib/rules';
import type { User, Workshop } from '@/lib/types';
import { ArrowIcon } from './icons';

export function RegistrationButton({ workshop, user }: { workshop: Workshop; user: User | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function register() {
    setPending(true); setError('');
    try { await api('/registrations', { method: 'POST', body: JSON.stringify({ workshop: workshop._id }) }); router.push('/registrations?registered=1'); router.refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to register. Please try again.'); setPending(false); }
  }
  if (user?.role === 'admin') return <div className="notice">Members register for workshops. You can manage all member registrations from your dashboard.<Link href="/registrations">Manage registrations <span aria-hidden="true">↗</span></Link></div>;
  if (!workshop.isActive || !isUpcoming(workshop.workshopDate)) return <div className="notice">{!workshop.isActive ? 'This workshop is currently unavailable.' : 'Registration has closed for this workshop.'}<Link href="/">Explore other workshops <span aria-hidden="true">↗</span></Link></div>;
  return <div className="registration-action">{error && <p className="form-error" role="alert">{error}</p>}{user ? <button className="button button-full" type="button" disabled={pending} onClick={register}>{pending ? 'Reserving your place…' : 'Register for this workshop'}{!pending && <ArrowIcon/>}</button> : <Link className="button button-full" href="/login">Log in to register <ArrowIcon/></Link>}<p className="fine-print">You can hold up to 3 active workshop registrations. Manage or cancel them from your registrations.</p></div>;
}
