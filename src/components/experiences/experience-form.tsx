
"use client";

import { useFormStatus } from "react-dom";
import { createExperienceAction } from "@/lib/actions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { useEffect, useRef, useActionState } from "react";
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "در حال ارسال..." : "ارسال تجربه"}
    </Button>
  );
}

export default function ExperienceForm() {
  const [state, formAction] = useActionState(createExperienceAction, { errors: {} });
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.errors?._form) {
      toast({
        title: "خطا",
        description: state.errors._form[0],
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <form ref={formRef} action={formAction}>
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
          {state.errors?._form && (
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
