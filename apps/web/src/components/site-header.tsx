import Link from 'next/link';
import type { User } from '@/lib/types';
import { LogoutButton } from './logout-button';

export function SiteHeader({ user }: { user: User | null }) {
  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="wordmark" aria-label="CraftTable home"><span className="brand-mark" aria-hidden="true">✳</span>CraftTable<span className="brand-dot">.</span></Link>
    <nav aria-label="Main navigation" className="main-nav">
      <Link href="/">Explore workshops</Link>
      {user && <Link href="/registrations">{user.role === 'admin' ? 'Registrations' : 'My registrations'}</Link>}
      {user?.role === 'admin' && <Link href="/admin/workshops">Manage workshops</Link>}
    </nav>
    <div className="account-nav">{user ? <><span className="account-name" title={user.name}>{user.name.split(' ')[0]}<small>{user.role === 'admin' ? 'Admin' : 'Member'}</small></span><LogoutButton /></> : <><Link className="login-link" href="/login">Log in</Link><Link className="button button-small" href="/register">Join the table <span aria-hidden="true">↗</span></Link></>}</div>
  </div></header>;
}
