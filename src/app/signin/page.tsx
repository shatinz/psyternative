'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signin } from '@/lib/actions';
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

export default function SigninPage() {
  const [state, formAction] = useActionState(signin, initialState);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <form action={formAction}>
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
              />
              {state.errors?.password && (
                <p className="text-sm text-destructive">{state.errors.password[0]}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            <SubmitButton>ورود</SubmitButton>
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
