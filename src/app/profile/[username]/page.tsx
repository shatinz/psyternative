
import React from 'react';
import ProfileUserLoader from './profile-user-loader';

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const unwrappedParams = React.use(params);
  return <ProfileUserLoader username={unwrappedParams.username} />;
}
