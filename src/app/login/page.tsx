
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "در حال ورود..." : "ورود"}
    </Button>
  );
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
        <form action={formAction}>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">ورود به حساب کاربری</CardTitle>
            <CardDescription>برای ادامه وارد حساب خود شوید.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            <p className="text-sm text-muted-foreground">
                حساب کاربری ندارید؟{" "}
              <Link href="/signup" className="text-primary hover:underline">
                ثبت نام کنید
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
