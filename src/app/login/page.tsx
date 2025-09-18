
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { signInAction } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Separator } from "@/components/ui/separator";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "در حال ورود..." : "ورود"}
    </Button>
  );
}

function GoogleSignInButton() {
  const { toast } = useToast();
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // The redirect is handled by the useAuth hook
    } catch (error: any) {
       let errorMessage = "An unexpected error occurred during Google sign-in.";
        if (error.code) {
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = "Sign-in process was cancelled.";
                    break;
                case 'auth/account-exists-with-different-credential':
                    errorMessage = "An account already exists with the same email. Please sign in using the method you originally used.";
                    break;
                default:
                    errorMessage = "Could not sign in with Google. Please try again.";
            }
        }
      toast({
        title: "خطا در ورود با گوگل",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return <Button variant="outline" onClick={handleGoogleSignIn} className="w-full">
    <svg className="ml-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-79.3 79.3C311.4 119.5 281.2 104 248 104c-73.8 0-134.2 59.8-134.2 133.4s60.4 133.4 134.2 133.4c52.3 0 92.5-23.4 110-44.9H248V261.8h232.2c5.9 32.7 8.9 66.8 8.9 101.2z"></path></svg>
    ورود با گوگل
    </Button>;
}

export default function LoginPage() {
  const [state, formAction] = useActionState(signInAction, { errors: {}, ran: false });
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);
  
  useEffect(() => {
    if (state.ran && state.errors?._form) {
      toast({
        title: "خطا در ورود",
        description: state.errors._form[0],
        variant: "destructive",
      });
    }
  }, [state, toast]);


  if (loading || user) {
    return <div className="container text-center p-8">در حال بارگذاری...</div>;
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">ورود به حساب کاربری</CardTitle>
          <CardDescription>برای ادامه وارد حساب خود شوید.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <GoogleSignInButton />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  یا با ایمیل ادامه دهید
                </span>
              </div>
            </div>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input id="email" name="email" type="email" placeholder="example@email.com" />
              {state.errors?.email && (
                <p className="text-sm text-destructive">{state.errors.email[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input id="password" name="password" type="password" />
              {state.errors?.password && (
                <p className="text-sm text-destructive">{state.errors.password[0]}</p>
              )}
            </div>
             <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
              حساب کاربری ندارید؟{" "}
            <Link href="/signup" className="text-primary hover:underline">
              ثبت نام کنید
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
