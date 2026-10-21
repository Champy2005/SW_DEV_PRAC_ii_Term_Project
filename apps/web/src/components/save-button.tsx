'use client';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, toggleSaved } from '@/store';
import { BookmarkIcon } from './icons';

export function SaveButton({ id, name, expanded = false }: { id: string; name: string; expanded?: boolean }) {
  const dispatch = useDispatch<AppDispatch>();
  const saved = useSelector((state: RootState) => state.savedWorkshops.ids.includes(id));
  return <button type="button" className={`save-button${saved ? ' is-saved' : ''}${expanded ? ' save-expanded' : ''}`} aria-pressed={saved} aria-label={`${saved ? 'Unsave' : 'Save'} ${name}`} onClick={() => dispatch(toggleSaved(id))} title={saved ? 'Remove from saved' : 'Save for later'}><BookmarkIcon fill={saved ? 'currentColor' : 'none'}/>{expanded && <span>{saved ? 'Saved for later' : 'Save for later'}</span>}</button>;
}
