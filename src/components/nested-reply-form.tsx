'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createReply } from '@/lib/actions';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from './submit-button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { mockUser } from '@/lib/data';

interface NestedReplyFormProps {
  postId: string;
  parentId: string;
  onSuccess: () => void;
}

const initialState = {
  message: '',
  errors: {},
  success: false,
};

export default function NestedReplyForm({ postId, parentId, onSuccess }: NestedReplyFormProps) {
  const [state, formAction] = useActionState(createReply, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const user = mockUser;

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'موفقیت‌آمیز',
        description: state.message,
      });
      formRef.current?.reset();
      onSuccess();
    } else if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: state.message + ' ' + (state.errors?.content?.[0] || ''),
      });
    }
  }, [state, toast, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="mt-4">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="parentId" value={parentId} />
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            id={`nested-reply-content-${parentId}`}
            name="content"
            placeholder={`پاسخ خود را بنویسید...`}
            rows={3}
            className="w-full"
          />
          {state.errors?.content && (
            <p className="text-sm text-destructive">
              {state.errors.content[0]}
            </p>
          )}
          <div className="flex justify-end">
            <SubmitButton size="sm">ارسال پاسخ</SubmitButton>
          </div>
        </div>
      </div>
    </form>
  );
}
