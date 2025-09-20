'use server';

import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {aiContentModeration} from '@/ai/flows/ai-content-moderation';
import {redirect} from 'next/navigation';
import { posts, mockUser, arts } from './data';

// Mock DB interactions
async function mockDBSuccess() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}

type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success: boolean;
};

const postSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد.'),
  content: z.string().min(10, 'محتوا باید حداقل ۱۰ کاراکتر باشد.'),
  sectionSlug: z.string(),
});

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

  const {title, content, sectionSlug} = validatedFields.data;

  try {
    const moderationResult = await aiContentModeration({text: content});

    if (moderationResult.flagForReview) {
      return {
        message: 'محتوای شما با قوانین مغایرت دارد.',
        errors: {
          content: [`دلیل: ${moderationResult.reason || 'محتوای نامناسب'}`],
        },
        success: false,
      };
    }

    // Add post to our mock DB
    const newPost = {
      id: `post-${Date.now()}`,
      title,
      content,
      author: mockUser,
      createdAt: new Date(),
      sectionSlug,
      replies: [],
    };
    posts.unshift(newPost);
    await mockDBSuccess();

    revalidatePath(`/sections/${sectionSlug}`);
    return {message: 'پست شما با موفقیت ایجاد شد.', success: true};
  } catch (e) {
    return {
      message: 'خطایی در هنگام ایجاد پست رخ داد.',
      success: false,
    };
  }
}

const replySchema = z.object({
  content: z.string().min(3, 'پاسخ باید حداقل ۳ کاراکتر باشد.'),
  postId: z.string(),
});

export async function createReply(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = replySchema.safeParse({
    content: formData.get('content'),
    postId: formData.get('postId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'لطفاً فرم را به درستی پر کنید.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { content, postId } = validatedFields.data;

  try {
    const moderationResult = await aiContentModeration({ text: content });

    if (moderationResult.flagForReview) {
      return {
        message: 'پاسخ شما با قوانین مغایرت دارد.',
        errors: {
          content: [`دلیل: ${moderationResult.reason || 'محتوای نامناسب'}`],
        },
        success: false,
      };
    }
    
    // Add reply to our mock DB
    const post = posts.find(p => p.id === postId);
    if (post) {
      const newReply = {
        id: `reply-${Date.now()}`,
        content,
        author: mockUser,
        createdAt: new Date(),
      };
      post.replies.push(newReply);
    }
    
    await mockDBSuccess();

    revalidatePath(`/posts/${postId}`);
    return { message: 'پاسخ شما با موفقیت ثبت شد.', success: true };
  } catch (e) {
    return {
      message: 'خطایی در هنگام ثبت پاسخ رخ داد.',
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
    return {message: 'پروفایل شما با موفقیت به روز شد.', success: true};
  } catch (e) {
    return {
      message: 'خطایی در هنگام به روز رسانی پروفایل رخ داد.',
      success: false,
    };
  }
}

const signupSchema = z
  .object({
    email: z.string().email('ایمیل نامعتبر است.'),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'رمزهای عبور یکسان نیستند.',
    path: ['confirmPassword'],
  });

export async function signup(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      message: 'لطفا فرم را به درستی پر کنید.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  // This is a mock implementation.
  // In a real app, you'd use Firebase Auth to create a user.
  console.log('Signing up user with data:', {
    email: formData.get('email'),
  });
  await mockDBSuccess();
  redirect('/');
}

const signinSchema = z.object({
  username: z.string().min(1, 'نام کاربری الزامی است.'),
  email: z.string().email('ایمیل نامعتبر است.'),
  password: z.string().min(1, 'رمز عبور الزامی است.'),
});

export async function signin(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = signinSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      message: 'لطفا فرم را به درستی پر کنید.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  // This is a mock implementation.
  // In a real app, you'd use Firebase Auth to sign in a user.
  console.log('Signing in user with data:', {
    username: formData.get('username'),
    email: formData.get('email'),
  });
  await mockDBSuccess();
  redirect('/');
}

export async function signout() {
  // This is a mock implementation.
  // In a real app, you'd use Firebase Auth to sign out a user.
  console.log('Signing out user');
  await mockDBSuccess();
  redirect('/signin');
}

const artSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد.'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد.'),
  price: z.coerce.number().min(0, 'قیمت نمی‌تواند منفی باشد.'),
});

export async function createArt(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // In a real app, you would handle file uploads properly.
  // For this mock, we'll just use a placeholder image URL.
  const validatedFields = artSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
  });

  if (!validatedFields.success) {
    return {
      message: 'لطفاً فرم را به درستی پر کنید.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { title, description, price } = validatedFields.data;

  try {
    const moderationResult = await aiContentModeration({ text: `${title} ${description}` });

    if (moderationResult.flagForReview) {
      return {
        message: 'محتوای شما با قوانین مغایرت دارد.',
        errors: {
          description: [`دلیل: ${moderationResult.reason || 'محتوای نامناسب'}`],
        },
        success: false,
      };
    }

    // Add art to our mock DB
    const newArt = {
      id: `art-${Date.now()}`,
      title,
      description,
      price,
      imageUrl: `https://picsum.photos/seed/${Date.now()}/600/400`,
      seller: mockUser,
      createdAt: new Date(),
    };
    arts.unshift(newArt);
    await mockDBSuccess();

    revalidatePath('/gallery');
    return { message: 'اثر هنری شما با موفقیت به گالری اضافه شد.', success: true };
  } catch (e) {
    return {
      message: 'خطایی در هنگام افزودن اثر هنری رخ داد.',
      success: false,
    };
  }
}
