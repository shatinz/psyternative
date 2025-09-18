
"use client";

import { useFormStatus } from "react-dom";
import { createExperienceAction } from "@/lib/actions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useEffect, useRef, useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { LogIn } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "در حال ارسال..." : "ارسال تجربه"}
    </Button>
  );
}

export default function ExperienceForm() {
  const [state, formAction] = useActionState(createExperienceAction, { errors: { _form: [] } });
  const { toast } = useToast();
  const { user, loading, idToken } = useAuth();
  
  useEffect(() => {
    if (state.errors?._form && state.errors._form.length > 0) {
      toast({
        title: "خطا",
        description: state.errors._form[0],
        variant: "destructive",
      });
    }
  }, [state, toast]);
  
  if (loading) {
    return <div className="text-center">در حال بارگذاری...</div>;
  }

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">ابتدا وارد شوید</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            برای ثبت تجربه جدید باید وارد حساب کاربری خود شوید.
          </p>
          <Button asChild>
            <Link href="/login">
              <LogIn className="ml-2" />
              ورود به حساب کاربری
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <form action={formAction}>
        <input type="hidden" name="idToken" value={idToken ?? ""} />
        <CardHeader>
          <CardTitle className="font-headline text-2xl">جزئیات تجربه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان</Label>
            <Input id="title" name="title" placeholder="یک عنوان برای تجربه خود بنویسید" />
            {state.errors?.title && (
              <p className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="experienceType">دسته بندی</Label>
            <Select name="experienceType">
              <SelectTrigger id="experienceType" className="w-full">
                <SelectValue placeholder="دسته بندی تجربه را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="psychedelics">روان‌گردان‌ها</SelectItem>
                <SelectItem value="dreams">رویاها</SelectItem>
                <SelectItem value="meditation">مدیتیشن</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.experienceType && (
              <p className="text-sm text-destructive">{state.errors.experienceType[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reportText">متن تجربه</Label>
            <Textarea
              id="reportText"
              name="reportText"
              placeholder="تجربه خود را با جزئیات شرح دهید..."
              rows={15}
            />
            {state.errors?.reportText && (
              <p className="text-sm text-destructive">{state.errors.reportText[0]}</p>
            )}
          </div>
          {state.errors?._form && state.errors?._form.length > 0 && (
             <Alert variant="destructive">
                <AlertDescription>{state.errors._form[0]}</AlertDescription>
             </Alert>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
