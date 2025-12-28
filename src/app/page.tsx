import { redirect } from 'next/navigation';

export default function Home() {
  // Automatically send users to the dashboard
  redirect('/dashboard');
}
