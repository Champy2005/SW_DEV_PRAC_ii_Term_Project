import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { getUser } from '@/lib/session';

export const metadata = { title: 'Create an account' };
export default async function RegisterPage() {
  if (await getUser()) redirect('/registrations');
  return <div className="auth-page page-width"><aside className="auth-story register-story"><p className="eyebrow">THERE’S ROOM FOR YOU HERE</p><h1>Bring your<br/><em>curiosity.</em><br/>We’ll make room.</h1><span className="auth-flower" aria-hidden="true">✳</span><p>Save your place in up to three workshops and try something new.</p></aside><section className="auth-panel"><p className="eyebrow">JOIN THE TABLE</p><h2>Start something new.</h2><p className="auth-intro">Create your member account to register for a workshop.</p><AuthForm mode="register"/></section></div>;
}
