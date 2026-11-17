'use client';
import Link from 'next/link';
import { useRef, useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatWorkshopDate, todayUtc } from '@/lib/rules';
import type { Workshop } from '@/lib/types';

export function WorkshopManager({ workshops }: { workshops: Workshop[] }) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  function openEditor(workshop: Workshop | null) {
    setEditing(workshop); setEditorOpen(true); setError(''); setSuccess(''); setDeleting(null);
    setTimeout(() => editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }
  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = { name: String(form.get('name')).trim(), description: String(form.get('description')).trim(), instructor: String(form.get('instructor')).trim(), workshopDate: String(form.get('workshopDate')), location: String(form.get('location')).trim(), capacity: Number(form.get('capacity')) };
    setPending(true); setError(''); setSuccess('');
    try {
      await api(editing ? `/workshops/${editing._id}` : '/workshops', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(body) });
      setSuccess(editing ? 'Workshop updated.' : 'Workshop created.'); setEditorOpen(false); setEditing(null); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save this workshop.'); }
    finally { setPending(false); }
  }
  async function remove(id: string) {
    setPending(true); setError(''); setSuccess('');
    try { await api(`/workshops/${id}`, { method: 'DELETE' }); setSuccess('Workshop deleted.'); setDeleting(null); router.refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete this workshop.'); }
    finally { setPending(false); }
  }
  return <div className="workshop-manager"><div className="manager-toolbar"><p>{workshops.length} workshop{workshops.length === 1 ? '' : 's'} in your collection</p><button className="button button-small" type="button" onClick={() => openEditor(null)} disabled={pending}>+ Create workshop</button></div>
    {success && <p className="form-success" role="status">{success}</p>}{error && <p className="form-error" role="alert">{error}</p>}
    {editorOpen && <div className="workshop-editor" ref={editorRef}><div className="section-heading"><h2>{editing ? 'Edit workshop' : 'Make room for a new workshop.'}</h2><button type="button" className="text-button" disabled={pending} onClick={() => { setEditorOpen(false); setError(''); }}>Close editor</button></div><form className="stack-form" onSubmit={save} key={editing?._id ?? 'new'} aria-label={editing ? 'Edit workshop' : 'Create workshop'}><div className="form-grid"><div className="field"><label htmlFor="workshop-name">Workshop name</label><input id="workshop-name" name="name" defaultValue={editing?.name} required maxLength={120} placeholder="An experience worth sharing"/></div><div className="field"><label htmlFor="instructor">Instructor</label><input id="instructor" name="instructor" defaultValue={editing?.instructor} required maxLength={100}/></div><div className="field field-wide"><label htmlFor="description">Description</label><textarea id="description" name="description" defaultValue={editing?.description} required maxLength={2000} rows={4} placeholder="What will participants learn and make?"/></div><div className="field"><label htmlFor="workshopDate">Workshop date (UTC)</label><input id="workshopDate" name="workshopDate" type="date" defaultValue={editing?.workshopDate.slice(0, 10)} min={todayUtc()} required/></div><div className="field"><label htmlFor="capacity">Total capacity</label><input id="capacity" name="capacity" type="number" min={1} max={10000} step={1} defaultValue={editing?.capacity ?? 12} required/></div><div className="field field-wide"><label htmlFor="location">Location</label><input id="location" name="location" defaultValue={editing?.location} required maxLength={200} placeholder="Studio or meeting point"/></div></div><div className="button-row"><button className="button" type="submit" disabled={pending}>{pending ? 'Saving workshop…' : editing ? 'Save changes' : 'Create workshop'}</button><button type="button" className="button button-secondary" disabled={pending} onClick={() => { setEditorOpen(false); setError(''); }}>Cancel</button></div></form></div>}
    <div className="admin-workshop-list">{workshops.length ? workshops.map((workshop) => <article key={workshop._id} className="admin-workshop"><div className="admin-workshop-row"><div className="admin-workshop-copy"><span className={`status-pill${workshop.isActive ? '' : ' inactive'}`}>{workshop.isActive ? 'Active' : 'Inactive'}</span><h2><Link href={`/workshops/${workshop._id}`}>{workshop.name}</Link></h2><p>{formatWorkshopDate(workshop.workshopDate)} <span aria-hidden="true">·</span> {workshop.location} <span aria-hidden="true">·</span> {workshop.capacity} places total</p></div><div className="button-row"><button type="button" className="button button-secondary button-small" disabled={pending} onClick={() => openEditor(workshop)}>Edit<span className="sr-only"> {workshop.name}</span></button><button type="button" className="text-button text-danger" disabled={pending} aria-expanded={deleting === workshop._id} onClick={() => { setDeleting(deleting === workshop._id ? null : workshop._id); setError(''); }}>Delete<span className="sr-only"> {workshop.name}</span></button></div></div>{deleting === workshop._id && <div className="inline-panel"><h3>Delete {workshop.name}?</h3><p>This hides the workshop from the catalog. Existing registration history is preserved.</p><div className="button-row"><button className="button button-danger button-small" type="button" disabled={pending} onClick={() => remove(workshop._id)}>{pending ? 'Deleting…' : 'Delete workshop'}</button><button className="button button-secondary button-small" type="button" disabled={pending} onClick={() => setDeleting(null)}>Keep workshop</button></div></div>}</article>) : <div className="empty-state"><h2>Your first workshop starts here.</h2><p>Create a workshop to give members something to look forward to.</p></div>}</div>
  </div>;
}
