import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;
export function ArrowIcon(props: IconProps) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
export function BookmarkIcon(props: IconProps) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M6.5 4h11v16l-5.5-3.5L6.5 20V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
}
export function SearchIcon(props: IconProps) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6"/><path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}
export function CalendarIcon(props: IconProps) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 3v4m8-4v4M4 11h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
export function PinIcon(props: IconProps) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
