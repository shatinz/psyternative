import { useState } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const initialState = {
  message: '',
  errors: {},
  success: false,
};

export default function SigninPage() {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState(initialState);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    let emailOrUsername = formData.get('emailOrUsername')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    if (!emailOrUsername) {
      setState({ message: '', errors: { emailOrUsername: ['ایمیل یا نام کاربری الزامی است.'] }, success: false });
      setLoading(false);
      return;
    }
    if (!password) {
      setState({ message: '', errors: { password: ['رمز عبور الزامی است.'] }, success: false });
      setLoading(false);
      return;
    }

    try {
      // If username, resolve to email using API route
      if (!emailOrUsername.includes('@')) {
        const res = await fetch(`/api/user?username=${encodeURIComponent(emailOrUsername.toLowerCase())}`);
        const { user } = await res.json();
        if (!user) {
          setState({ message: 'ایمیل یا رمز عبور نامعتبر است.', errors: {}, success: false });
          setLoading(false);
          return;
        }
        emailOrUsername = user.email;
      }
      const userCredential = await signInWithEmailAndPassword(auth, emailOrUsername, password);
      if (!userCredential.user.emailVerified) {
        setState({ message: 'لطفاً ابتدا ایمیل خود را تأیید کنید. ایمیل تأییدیه برای شما ارسال شده است.', errors: {}, success: false });
        setLoading(false);
        return;
      }
      setState({ message: '', errors: {}, success: true });
      window.location.href = '/';
    } catch (e: any) {
      let message = 'خطایی در هنگام ورود رخ داد. لطفاً دوباره امتحان کنید.';
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found') {
        message = 'ایمیل یا رمز عبور نامعتبر است.';
      }
      setState({ message, errors: {}, success: false });
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">ورود به حساب</CardTitle>
            <CardDescription>
              برای ادامه وارد حساب کاربری خود شوید.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.message && !state.success && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>خطا در ورود</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername">ایمیل یا نام کاربری</Label>
              <Input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                placeholder="email@example.com"
                required
                disabled={loading}
              />
              {state.errors?.emailOrUsername && (
                <p className="text-sm text-destructive">{state.errors.emailOrUsername[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
              />
              {state.errors?.password && (
                <p className="text-sm text-destructive">{state.errors.password[0]}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            <SubmitButton disabled={loading}>ورود</SubmitButton>
            <p className="text-center text-sm text-muted-foreground">
              حساب کاربری ندارید؟{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                ثبت نام کنید
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
