'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, CheckCircle } from 'lucide-react';


const initialState = {
  message: '',
  errors: {},
  success: false,
  loading: false,
};

export default function SignupPage() {
  const [state, setState] = useState(initialState);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ ...initialState, loading: true });
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      setState({ ...initialState, message: 'لطفاً همه فیلدها را پر کنید.' });
      return;
    }
    if (password !== confirmPassword) {
      setState({ ...initialState, message: 'رمزهای عبور یکسان نیستند.' });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      await sendEmailVerification(userCredential.user);
      // Call API to create user in PostgreSQL
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userCredential.user.uid,
          username,
          email
        })
      });
      setState({ ...initialState, success: true, message: 'ثبت نام موفقیت آمیز بود. لطفا ایمیل خود را برای تایید چک کنید.' });
    } catch (e: any) {
      let message = 'خطایی در هنگام ثبت نام رخ داد.';
      if (e.code === 'auth/email-already-in-use') {
        message = 'این ایمیل قبلا استفاده شده است.';
      } else if (e.message) {
        message += `\n${e.message}`;
      }
      setState({ ...initialState, message });
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">ایجاد حساب جدید</CardTitle>
            <CardDescription>
              برای پیوستن به جامعه ما، فرم زیر را پر کنید.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.message && (
              <Alert variant={state.success ? 'default' : 'destructive'}>
                {state.success ? <CheckCircle className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
                <AlertTitle>{state.success ? 'موفقیت' : 'خطا در ثبت نام'}</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            {!state.success && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">نام کاربری</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="یک نام کاربری انتخاب کنید"
                    required
                  />
                  {state.errors?.username && (
                    <p className="text-sm text-destructive">{state.errors.username[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                  />
                  {state.errors?.email && (
                    <p className="text-sm text-destructive">{state.errors.email[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                  {state.errors?.password && (
                    <p className="text-sm text-destructive">{state.errors.password[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                  />
                  {state.errors?.confirmPassword && (
                    <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            {!state.success && <SubmitButton>ثبت نام</SubmitButton>}
            <p className="text-center text-sm text-muted-foreground">
              قبلاً ثبت نام کرده‌اید؟{' '}
              <Link href="/signin" className="font-semibold text-primary hover:underline">
                وارد شوید
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
