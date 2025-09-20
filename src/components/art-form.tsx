'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createArt } from '@/lib/actions';
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
import { Upload } from 'lucide-react';

const initialState = {
  message: '',
  errors: {},
  success: false,
};

export default function ArtForm() {
  const [state, formAction] = useActionState(createArt, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

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
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <form ref={formRef} action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            ثبت اثر جدید
          </CardTitle>
          <CardDescription>
            اثر هنری یا صنایع دستی خود را برای فروش قرار دهید.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان اثر</Label>
            <Input
              id="title"
              name="title"
              placeholder="مثال: گلدان سفالی میناکاری"
            />
            {state.errors?.title && (
              <p className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="درباره اثر خود بنویسید..."
              rows={4}
            />
            {state.errors?.description && (
              <p className="text-sm text-destructive">{state.errors.description[0]}</p>
            )}
          </div>
           <div className="space-y-2">
            <Label htmlFor="price">قیمت (تومان)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="مثال: 250000"
            />
            {state.errors?.price && (
              <p className="text-sm text-destructive">{state.errors.price[0]}</p>
            )}
          </div>
           <div className="space-y-2">
            <Label htmlFor="image">تصویر اثر</Label>
            <div className="flex items-center justify-center w-full">
                <Label htmlFor="image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">برای آپلود کلیک کنید</span></p>
                        <p className="text-xs text-muted-foreground">SVG, PNG, JPG (حداکثر 2 مگابایت)</p>
                    </div>
                    <Input id="image" name="image" type="file" className="hidden" />
                </Label>
            </div>
           </div>
        </CardContent>
        <CardFooter>
          <SubmitButton>ثبت و انتشار</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
