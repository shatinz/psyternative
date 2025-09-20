import { notFound } from 'next/navigation';
import { getProfileUser } from '@/lib/actions';
import ProfileClientPage from '@/components/profile-client-page';
import { auth } from '@/lib/firebase';
import { cookies } from 'next/headers';

async function getCurrentUser() {
  // This is a simplified way to get the current user on the server.
  // In a real app, you'd likely use a more robust session management solution.
  // For this demo, we can't access client-side auth state directly here.
  // We'll pass the profile user and let the client figure out if it's "us".
  return null;
}

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const profileUser = await getProfileUser(params.username);

  if (!profileUser) {
    notFound();
  }

  return <ProfileClientPage profileUser={profileUser} />;
}
