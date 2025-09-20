'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { aiContentModeration } from '@/ai/flows/ai-content-moderation';
import { useToast } from '@/hooks/use-toast';

// Mock DB interactions
async function mockDBSuccess() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}

const postSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد.'),
  content: z.string().min(10, 'محتوا باید حداقل ۱۰ کاراکتر باشد.'),
  sectionSlug: z.string(),
});

type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success: boolean;
};

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = postSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    sectionSlug: formData.get('sectionSlug'),
  });

  if (!validatedFields.success) {
    return {
      message: 'لطفاً فرم را به درستی پر کنید.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { title, content, sectionSlug } = validatedFields.data;

  try {
    const moderationResult = await aiContentModeration({ text: content });

    if (moderationResult.flagForReview) {
      return {
        message: 'محتوای شما با قوانین مغایرت دارد.',
        errors: {
          content: [
            `دلیل: ${moderationResult.reason || 'محتوای نامناسب'}`,
          ],
        },
        success: false,
      };
    }

    // Pretend to save to DB
    await mockDBSuccess();
    console.log('Post created:', { title, content, sectionSlug });

    revalidatePath(`/sections/${sectionSlug}`);
    return { message: 'پست شما با موفقیت ایجاد شد.', success: true };
  } catch (e) {
    return {
      message: 'خطایی در هنگام ایجاد پست رخ داد.',
      success: false,
    };
  }
}

const profileSchema = z.object({
  username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد.'),
});

export async function updateProfile(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = profileSchema.safeParse({
    username: formData.get('username'),
  });

  if (!validatedFields.success) {
    return {
      message: 'لطفاً فرم را به درستی پر کنید.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  // TODO: Fetch user from DB and check `hasChangedUsername`
  const canChangeUsername = true; // Mock value

  if (!canChangeUsername) {
    return {
      message: 'شما قبلاً نام کاربری خود را تغییر داده‌اید.',
      success: false,
    };
  }

  try {
    // Pretend to save to DB
    await mockDBSuccess();
    console.log('Username updated to:', validatedFields.data.username);

    revalidatePath('/profile');
    return { message: 'پروفایل شما با موفقیت به روز شد.', success: true };
  } catch (e) {
    return {
      message: 'خطایی در هنگام به روز رسانی پروفایل رخ داد.',
      success: false,
    };
  }
}
