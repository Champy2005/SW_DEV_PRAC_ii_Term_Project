'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { formatWorkshopDate, isUpcoming } from '@/lib/rules';
import type { Registration, User, Workshop } from '@/lib/types';
import { CalendarIcon, PinIcon } from './icons';

export function RegistrationsList({ registrations, workshops, user }: { registrations: Registration[]; workshops: Workshop[]; user: User }) {
  return registrations.length ? <div className="registrations-list">{registrations.map((registration) => <RegistrationItem key={registration._id} registration={registration} workshops={workshops} admin={user.role === 'admin'}/>)}</div> : <div className="empty-state"><span className="empty-symbol" aria-hidden="true">✳</span><h2>{user.role === 'admin' ? 'The next chapter starts with a registration.' : 'Your next experience is waiting.'}</h2><p>{user.role === 'admin' ? 'Registrations will appear here as members join a workshop.' : 'Find a workshop you love, reserve your place, and we’ll keep the details here.'}</p><Link href="/" className="button">Explore workshops <span aria-hidden="true">↗</span></Link></div>;
}

function RegistrationItem({ registration, workshops, admin }: { registration: Registration; workshops: Workshop[]; admin: boolean }) {
  const router = useRouter();
  const [action, setAction] = useState<'move' | 'cancel' | null>(null);
  const [workshopId, setWorkshopId] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const workshop = registration.workshop;
  const options = workshops.filter((item) => item.isActive && isUpcoming(item.workshopDate) && item._id !== workshop?._id);
  async function mutate(method: 'PUT' | 'DELETE') {
    setPending(true); setError('');
    try {
      await api(`/registrations/${registration._id}`, { method, ...(method === 'PUT' ? { body: JSON.stringify({ workshop: workshopId }) } : {}) });
      setAction(null); setPending(false); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update this registration.'); setPending(false); }
  }
  function toggle(next: 'move' | 'cancel') { setAction(action === next ? null : next); setError(''); }
  return <article className="registration-card" aria-label={workshop?.name ?? 'Unavailable workshop registration'}>
    <div className="registration-overview"><div className="registration-icon" aria-hidden="true">✳</div><div className="registration-details"><p className="eyebrow">{workshop?.isActive && isUpcoming(workshop.workshopDate) ? 'ON YOUR CALENDAR' : 'WORKSHOP REGISTRATION'}</p><h2>{workshop?.isActive ? <Link href={`/workshops/${workshop._id}`}>{workshop.name}</Link> : workshop ? `${workshop.name} (unavailable)` : 'Workshop no longer available'}</h2>{workshop && <div className="inline-meta"><span><CalendarIcon/>{formatWorkshopDate(workshop.workshopDate)}</span><span><PinIcon/>{workshop.location}</span></div>}{admin && <p className="attendee">Registered by <strong>{registration.user?.name ?? 'Deleted member'}</strong>{registration.user?.email && <> · {registration.user.email}</>}{registration.user?.tel && <> · {registration.user.tel}</>}</p>}<p className="registration-ref">Reference ID <code>{registration._id}</code></p></div><div className="registration-controls"><button type="button" className="button button-secondary button-small" disabled={pending} aria-expanded={action === 'move'} onClick={() => toggle('move')}>Change workshop</button><button type="button" className="text-button text-danger" disabled={pending} aria-expanded={action === 'cancel'} onClick={() => toggle('cancel')}>Cancel registration</button></div></div>
    {action === 'cancel' && <div className="inline-panel"><h3>Cancel this registration?</h3><p>Your place will be released. You can register again if a place is available.</p><div className="button-row"><button type="button" className="button button-danger button-small" disabled={pending} onClick={() => mutate('DELETE')}>{pending ? 'Cancelling…' : 'Yes, cancel registration'}</button><button type="button" className="button button-secondary button-small" disabled={pending} onClick={() => setAction(null)}>Keep registration</button></div></div>}
    {action === 'move' && <form className="inline-panel" onSubmit={(event) => { event.preventDefault(); void mutate('PUT'); }}><h3>Try something else.</h3>{options.length ? <><div className="field"><label htmlFor={`move-${registration._id}`}>Choose a workshop</label><select id={`move-${registration._id}`} value={workshopId} onChange={(event) => setWorkshopId(event.target.value)} required disabled={pending}><option value="">Select a workshop</option>{options.map((item) => <option value={item._id} key={item._id}>{item.name} — {formatWorkshopDate(item.workshopDate)}</option>)}</select></div><div className="button-row"><button className="button button-small" disabled={pending || !workshopId} type="submit">{pending ? 'Moving registration…' : 'Move registration'}</button><button className="button button-secondary button-small" disabled={pending} type="button" onClick={() => setAction(null)}>Keep current workshop</button></div></> : <p>There are no other upcoming workshops available right now.</p>}</form>}
    {error && <p className="form-error registration-error" role="alert">{error}</p>}
  </article>;
}
