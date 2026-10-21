'use client';
import Link from 'next/link';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="page-width error-page"><p className="eyebrow">A SMALL DETOUR</p><h1>We couldn’t set the table.</h1><p>Something went wrong while loading this page. Please try again.</p><div className="button-row"><button className="button" type="button" onClick={reset}>Try again</button><Link href="/" className="button button-secondary">Back to workshops</Link></div></div>;
}
