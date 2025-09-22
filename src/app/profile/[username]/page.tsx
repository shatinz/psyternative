
"use client";
import ProfileUserLoader from './profile-user-loader';

export default function UserProfilePage({ params }: { params: { username: string } }) {
  return <ProfileUserLoader username={params.username} />;
}
