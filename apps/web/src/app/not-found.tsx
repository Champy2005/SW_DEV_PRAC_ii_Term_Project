import Link from 'next/link';

export default function NotFound() {
  return <div className="page-width error-page"><p className="eyebrow">404 · NOT AT THIS TABLE</p><h1>This page has wandered off.</h1><p>The workshop or page you’re looking for could not be found.</p><Link href="/" className="button">Explore workshops <span aria-hidden="true">↗</span></Link></div>;
}
