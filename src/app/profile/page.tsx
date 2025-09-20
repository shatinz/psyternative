import ProfileForm from '@/components/profile-form';
import { mockUser } from '@/lib/data';

export default function ProfilePage() {
  // In a real app, you would fetch the current user's data here
  const user = mockUser;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold">پروفایل کاربری</h1>
        <p className="text-muted-foreground">
          اطلاعات حساب کاربری خود را مدیریت کنید.
        </p>
      </header>

      <ProfileForm user={user} />
    </div>
  );
}
