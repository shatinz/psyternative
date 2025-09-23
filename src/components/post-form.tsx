'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createPost } from '@/lib/actions';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from './submit-button';
import { useAuth } from '@/hooks/use-auth';

interface PostFormProps {
  sectionSlug: string;
}

const initialState = {
  message: '',
  errors: {},
  success: false,
};

export default function PostForm({ sectionSlug }: PostFormProps) {
  const [state, formAction] = useActionState(createPost, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'موفقیت‌آمیز',
        description: state.message,
      });
      formRef.current?.reset();
    } else if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description:
          state.message + ' ' + (state.errors?.content?.[0] || ''),
      });
    }
  }, [state, toast]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            برای ایجاد پست جدید، لطفا وارد حساب کاربری خود شوید.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <form ref={formRef} action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            ایجاد پست جدید
          </CardTitle>
          <CardDescription>
            تجربیات و سوالات خود را با دیگران به اشتراک بگذارید.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="hidden" name="sectionSlug" value={sectionSlug} />
          <input type="hidden" name="userId" value={user.id} />
          <div className="space-y-2">
            <Label htmlFor="title">عنوان پست</Label>
            <Input
              id="title"
              name="title"
              placeholder="یک عنوان جذاب انتخاب کنید"
            />
            {state.errors?.title && (
              <p className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">محتوای پست</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="داستان خود را بنویسید..."
              rows={6}
            />
            {state.errors?.content && (
              <p className="text-sm text-destructive">{state.errors.content[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton>ارسال پست</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
