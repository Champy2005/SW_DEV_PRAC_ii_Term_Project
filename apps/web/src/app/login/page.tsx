import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { getUser } from '@/lib/session';

export const metadata = { title: 'Log in' };
export default async function LoginPage() {
  if (await getUser()) redirect('/registrations');
  return <div className="auth-page page-width"><aside className="auth-story"><p className="eyebrow">A SEAT WITH YOUR NAME ON IT</p><h1>Good to<br/>have you<br/><em>back.</em></h1><span className="auth-flower" aria-hidden="true">✳</span><p>Your next little adventure is just around the corner.</p></aside><section className="auth-panel"><p className="eyebrow">WELCOME BACK</p><h2>Pull up a chair.</h2><p className="auth-intro">Log in to book workshops and manage your registrations.</p><AuthForm mode="login"/></section></div>;
}
