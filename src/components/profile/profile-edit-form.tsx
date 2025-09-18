
"use client";

import { useAuth } from "@/lib/auth-context";
import { UserProfile } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useActionState, useEffect, useState } from "react";
import { updateProfileAction } from "@/lib/actions";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useFormStatus } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";

function SubmitButton() {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ? "در حال ذخیره..." : "ذخیره تغییرات"}</Button>
}

export default function ProfileEditForm({ userProfile }: { userProfile: UserProfile }) {
  const { user, idToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  const [state, formAction] = useActionState(updateProfileAction, { errors: {} });

  useEffect(() => {
    // Only show toasts for form-level errors now, as success is handled by redirect.
    if (state?.errors?._form) {
      toast({ title: "خطا", description: state.errors._form[0], variant: "destructive" });
    }
  }, [state, toast]);

  if (user?.uid !== userProfile.uid) {
    return null; // Don't show edit form if not the owner
  }

  if (!isEditing) {
    return (
        <div className="flex justify-start">
            <Button variant="outline" onClick={() => setIsEditing(true)}><Edit className="ml-2 h-4 w-4" /> ویرایش پروفایل</Button>
        </div>
    )
  }

  return (
    <Card className="mt-4 border-primary">
        <CardHeader>
            <CardTitle>ویرایش پروفایل</CardTitle>
            <CardDescription>نام نمایشی و نام کاربری خود را بروزرسانی کنید.</CardDescription>
        </CardHeader>
        <form action={formAction}>
            <input type="hidden" name="idToken" value={idToken ?? ""} />
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="displayName">نام نمایشی</Label>
                    <Input id="displayName" name="displayName" defaultValue={userProfile.displayName} />
                    {state?.errors?.displayName && <p className="text-sm text-destructive">{state.errors.displayName[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="username">نام کاربری</Label>
                    <Input id="username" name="username" defaultValue={userProfile.username} />
                    {state?.errors?.username && <p className="text-sm text-destructive">{state.errors.username[0]}</p>}
                </div>
                 {state?.errors?._form && <p className="text-sm text-destructive">{state.errors._form[0]}</p>}
            </CardContent>
            <CardFooter className="gap-4">
                <SubmitButton />
                <Button variant="ghost" onClick={() => setIsEditing(false)}>لغو</Button>
            </CardFooter>
        </form>
    </Card>
  )
}
