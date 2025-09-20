'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signup } from '@/lib/actions';
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
import { Terminal } from 'lucide-react';

const initialState = {
  message: '',
  errors: {},
  success: false,
};

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, initialState);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">ایجاد حساب جدید</CardTitle>
            <CardDescription>
              برای پیوستن به جامعه ما، فرم زیر را پر کنید.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.message && !state.success && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>خطا در ثبت نام</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
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
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            <SubmitButton>ثبت نام</SubmitButton>
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