import Link from 'next/link';
import { redirect } from 'next/navigation';
import { RegistrationsList } from '@/components/registrations-list';
import { getUser } from '@/lib/session';
import { serverApi } from '@/lib/server';
import type { Registration, Workshop } from '@/lib/types';
import { isUpcoming } from '@/lib/rules';

export const metadata = { title: 'Registrations' };
export default async function RegistrationsPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const user = await getUser();
  if (!user) redirect('/login');
  const [registrations, workshops, params] = await Promise.all([serverApi<Registration[]>('/registrations'), serverApi<Workshop[]>('/workshops'), searchParams]);
  const admin = user.role === 'admin';
  const activeCount = registrations.filter((item) => item.workshop?.isActive && isUpcoming(item.workshop.workshopDate)).length;
  return <div className="page-width dashboard-page"><div className="dashboard-heading"><div><p className="eyebrow">{admin ? 'THE WHOLE TABLE' : 'A LITTLE TIME FOR YOU'}</p><h1>{admin ? 'All registrations.' : 'Your plans, taking shape.'}</h1><p>{admin ? 'View member registrations, move a booking, or release a place.' : `You have ${activeCount} of 3 active workshop registrations. Your next experience is right here.`}</p></div><Link href="/" className="button button-secondary">Explore workshops <span aria-hidden="true">↗</span></Link></div>{params.registered === '1' && <p className="form-success" role="status">You’re registered! Your workshop details are below.</p>}<RegistrationsList registrations={registrations} workshops={workshops} user={user}/><p className="dashboard-footnote">Dates are shown in UTC. Workshop capacity is the total group size.</p></div>;
}
