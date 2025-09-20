'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createReply } from '@/lib/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from './submit-button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { mockUser } from '@/lib/data';

interface ReplyFormProps {
  postId: string;
}

const initialState = {
  message: '',
  errors: {},
  success: false,
};

export default function ReplyForm({ postId }: ReplyFormProps) {
  const [state, formAction] = useActionState(createReply, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const user = mockUser; // In a real app, you'd get this from a session

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
        description: state.message + ' ' + (state.errors?.content?.[0] || ''),
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <form ref={formRef} action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline text-xl">پاسخ خود را ثبت کنید</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="hidden" name="postId" value={postId} />
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Label htmlFor="content" className="sr-only">
                محتوای پاسخ
              </Label>
              <Textarea
                id="content"
                name="content"
                placeholder={`در پاسخ به ${user.name} بنویسید...`}
                rows={4}
              />
              {state.errors?.content && (
                <p className="text-sm text-destructive">
                  {state.errors.content[0]}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <SubmitButton>ارسال پاسخ</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
