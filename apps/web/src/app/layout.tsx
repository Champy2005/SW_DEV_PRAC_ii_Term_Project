import type { Metadata } from 'next';
import Link from 'next/link';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/site-header';
import { getUser } from '@/lib/session';
import './globals.css';

export const metadata: Metadata = { title: { default: 'CraftTable — Make room for something new', template: '%s · CraftTable' }, description: 'Discover hands-on workshops, meet your next creative interest, and save a place at the table.' };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();
  return <html lang="en"><body><Providers><a href="#main-content" className="skip-link">Skip to main content</a><SiteHeader user={user}/><main id="main-content">{children}</main><footer className="site-footer"><div className="footer-inner"><Link href="/" className="wordmark"><span className="brand-mark" aria-hidden="true">✳</span>CraftTable<span className="brand-dot">.</span></Link><p>A little time for something new.</p><span className="footer-note">Workshop registration · Course project 3</span></div></footer></Providers></body></html>;
}
