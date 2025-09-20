'use client';

import { useActionState, useEffect } from 'react';
import { updateProfile } from '@/lib/actions';
import type { User } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from './submit-button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

interface ProfileFormProps {
  user: User;
}

const initialState = {
  message: '',
  errors: {},
  success: false,
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfile, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'موفقیت‌آمیز' : 'خطا',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 border-4 border-primary/50">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile portrait" />
              <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="pt-4 font-headline text-2xl">{user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">تغییر عکس پروفایل</Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              قابلیت آپلود عکس به زودی اضافه می‌شود.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <form action={formAction}>
           <input type="hidden" name="userId" value={user.id} />
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">ویرایش پروفایل</CardTitle>
              <CardDescription>
                نام کاربری خود را می‌توانید تنها یک بار تغییر دهید.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="username">نام کاربری</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={user.name}
                  disabled={user.hasChangedUsername}
                />
                {state.errors?.username && (
                  <p className="text-sm text-destructive">{state.errors.username[0]}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton disabled={user.hasChangedUsername}>
                {user.hasChangedUsername ? 'تغییر داده شده' : 'ذخیره تغییرات'}
              </SubmitButton>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
