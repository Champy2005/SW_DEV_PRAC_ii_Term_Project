'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body style={{ margin: 0, padding: '15vh 8vw', background: '#f8f7f1', color: '#223c31', fontFamily: 'Arial, sans-serif' }}><main><p style={{ fontSize: 11, letterSpacing: 2 }}>CRAFTTABLE · A SMALL DETOUR</p><h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400 }}>We couldn’t set the table.</h1><p style={{ lineHeight: 1.7 }}>The service is temporarily unavailable. Please try again in a moment.</p><button type="button" onClick={reset} style={{ marginTop: 15, padding: '14px 23px', background: '#264d3b', color: '#fffefa', border: 0, cursor: 'pointer', fontSize: 14 }}>Try again</button></main></body></html>;
}
