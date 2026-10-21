import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarIcon, PinIcon } from '@/components/icons';
import { RegistrationButton } from '@/components/registration-button';
import { SaveButton } from '@/components/save-button';
import { WorkshopArt } from '@/components/workshop-art';
import { countActiveRegistrations, formatWorkshopDate } from '@/lib/rules';
import { serverApi } from '@/lib/server';
import { getUser } from '@/lib/session';
import type { Registration, Workshop } from '@/lib/types';

export const metadata = { title: 'Workshop details' };
export default async function WorkshopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  let workshop: Workshop;
  try { workshop = await serverApi<Workshop>(`/workshops/${id}`); }
  catch (error) {
    if (error instanceof Error && /not found|404|no workshop/i.test(error.message)) notFound();
    throw error;
  }
  const user = await getUser();
  // Members see their current state before submitting; the API still enforces every rule.
  const mine = user?.role === 'member' ? await serverApi<Registration[]>('/registrations') : [];
  const existing = mine.find((item) => item.workshop?._id === workshop._id) ?? null;
  const activeCount = countActiveRegistrations(mine);
  return <div className="page-width detail-page"><Link href="/" className="back-link"><span aria-hidden="true">←</span> All workshops</Link><div className="detail-grid"><div className="detail-main"><WorkshopArt index={parseInt(id.slice(-2), 16) % 4} large/><div className="detail-story"><p className="eyebrow">A LITTLE TIME. SOMETHING NEW.</p><h2>What’s on the table?</h2><p className="description-text">{workshop.description}</p><div className="instructor-note"><span aria-hidden="true">✳</span><div><p className="eyebrow">YOUR WORKSHOP INSTRUCTOR</p><h3>{workshop.instructor}</h3></div></div></div></div><aside className="detail-sidebar"><span className="status-pill">{workshop.isActive ? 'Hands-on workshop' : 'Currently unavailable'}</span><h1>{workshop.name}</h1><p className="detail-intro">An experience to make time for. Bring your curiosity and we’ll take it from there.</p><dl className="detail-facts"><div><dt><CalendarIcon/> When</dt><dd>{formatWorkshopDate(workshop.workshopDate)}<small>Workshop dates use UTC</small></dd></div><div><dt><PinIcon/> Where</dt><dd>{workshop.location}</dd></div><div><dt><span aria-hidden="true">◎</span> Group size</dt><dd>{workshop.capacity} places total</dd></div></dl><RegistrationButton workshop={workshop} user={user} existing={existing} activeCount={activeCount}/><SaveButton id={workshop._id} name={workshop.name} expanded/></aside></div></div>;
}
