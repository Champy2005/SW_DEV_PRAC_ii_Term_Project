import { redirect } from 'next/navigation';
import { WorkshopManager } from '@/components/workshop-manager';
import { getUser } from '@/lib/session';
import { serverApi } from '@/lib/server';
import type { Workshop } from '@/lib/types';

export const metadata = { title: 'Manage workshops' };
export default async function AdminWorkshopsPage() {
  const user = await getUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/');
  const workshops = await serverApi<Workshop[]>('/workshops');
  return <div className="page-width dashboard-page"><div className="dashboard-heading"><div><p className="eyebrow">WORKSHOP STUDIO · ADMIN</p><h1>Make good things happen.</h1><p>Create, update, and manage the workshops at your table.</p></div><span className="admin-badge">Admin workspace</span></div><WorkshopManager workshops={workshops}/></div>;
}
