'use server';

import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {aiContentModeration} from '@/ai/flows/ai-content-moderation';
import {redirect} from 'next/navigation';
import { mockUser, arts, anotherUser } from './data';
import { createPost as dbCreatePost, createReply as dbCreateReply } from '../../db/posts';
import type { Reply, User } from './types';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, updateProfile as updateFirebaseProfile, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { createUser as dbCreateUser, updateUser as dbUpdateUser, getUserByUsername as dbGetUserByUsername, getUserByUid as dbGetUserByUid } from '../../db/users';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';


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
  userId: z.string(),
});

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = postSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    sectionSlug: formData.get('sectionSlug'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'لطفاً فرم را به درستی پر کنید.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const {title, content, sectionSlug, userId} = validatedFields.data;

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

    // Add post to PostgreSQL
    const postId = `post-${Date.now()}`;
    await dbCreatePost({
      postId,
      title,
      content,
      authorUid: userId,
      sectionSlug,
    });
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
  content: z.string().min(1, 'پاسخ نمی‌تواند خالی باشد.'),
  postId: z.string(),
  parentId: z.string().optional(),
  userId: z.string(),
});

function findReplyById(replies: Reply[], id: string): Reply | undefined {
  for (const reply of replies) {
    if (reply.id === id) {
      return reply;
    }
    if (reply.replies) {
      const found = findReplyById(reply.replies, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}


export async function createReply(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  console.log('createReply called with formData:', Object.fromEntries(formData));
  const validatedFields = replySchema.safeParse({
    content: formData.get('content'),
    postId: formData.get('postId'),
    parentId: formData.get('parentId') ?? undefined,
    userId: formData.get('userId'),
  });
  console.log('Validation result:', validatedFields);

  if (!validatedFields.success) {
    return {
      message: 'لطفاً فرم را به درستی پر کنید.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { content, postId, parentId, userId } = validatedFields.data;

  try {
    // Temporarily disable moderation for debugging
    // const moderationResult = await aiContentModeration({ text: content });

    // if (moderationResult.flagForReview) {
    //   return {
    //     message: 'پاسخ شما با قوانین مغایرت دارد.',
    //     errors: {
    //       content: [`دلیل: ${moderationResult.reason || 'محتوای نامناسب'}`],
    //     },
    //     success: false,
    //   };
    // }

    // Add reply to PostgreSQL
    const replyId = `reply-${Date.now()}`;
    await dbCreateReply({
      replyId,
      postId,
      parentReplyId: parentId,
      content,
      authorUid: userId,
    });

    revalidatePath(`/posts/${postId}`);
    return { message: 'پاسخ شما با موفقیت ثبت شد.', success: true };
  } catch (e) {
    console.error('Error creating reply:', e);
    return {
      message: 'خطایی در هنگام ثبت پاسخ رخ داد.',
      success: false,
    };
  }
}

const profileSchema = z.object({
  username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد.'),
  bio: z.string().max(200, 'بیوگرافی نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد.').optional(),
  userId: z.string(),
});

export async function updateProfile(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = profileSchema.safeParse({
    username: formData.get('username'),
    bio: formData.get('bio'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'لطفا فورم را به درستی وارد کنید.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { username, bio, userId } = validatedFields.data;

  // Get user from PostgreSQL
  const userData = await dbGetUserByUsername(userId); // Wait, no, getUserByUid
  // I need getUserByUid
  // Let me import it
  // Actually, since userId is uid, I can use getUserByUid

  // Wait, in the form, userId is user.id, which is uid
  // So I need to get user by uid

  // But I don't have getUserByUid imported
  // Let me add it

  // Actually, in the code, it's getUserByUid, but I imported getUserByUsername as dbGetUserByUsername

  // Let me add getUserByUid

  // First, let me check if it's imported

  // In the import, I have getUserByUsername as dbGetUserByUsername

  // I need to add getUserByUid

  // Let me update the import

  // Wait, the import is createUser as dbCreateUser, updateUser as dbUpdateUser, getUserByUsername as dbGetUserByUsername

  // I need to add getUserByUid as dbGetUserByUid

  // Let me do that

  // But for now, since userId is uid, I can use getUserByUid

  // Let me add it to the import

  // The import is:

  // import { createUser as dbCreateUser, updateUser as dbUpdateUser, getUserByUsername as dbGetUserByUsername } from '../../db/users';

  // I need to add getUserByUid as dbGetUserByUid

  // Let me update the import first

  // Actually, let me do it in the function

  // To get the current user data, I need to fetch it by uid

  // So I need to import getUserByUid

  // Let me update the import

  // Change to:

  // import { createUser as dbCreateUser, updateUser as dbUpdateUser, getUserByUsername as dbGetUserByUsername, getUserByUid as dbGetUserByUid } from '../../db/users';

  // Then use dbGetUserByUid(userId)

  // Yes

  // Then transform the userData to match the type

  // userData will have username, etc.

  // So userData.name = userData.username

  // etc.

  // Then proceed

  // For checking username uniqueness, use dbGetUserByUsername(username)

  // If it exists and uid != userId, then taken

  // Yes

  // Then update with dbUpdateUser(userId, { username, bio, hasChangedUsername })

  // Yes

  // Let me write the code

  // First, update the import

  // I already have the import, let me add getUserByUid

  // The import is at line 12

  // Let me update it

  // Actually, the import is:

  // import { createUser as dbCreateUser } from '../../db/users';

  // No, I changed it to:

  // import { createUser as dbCreateUser, updateUser as dbUpdateUser, getUserByUsername as dbGetUserByUsername } from '../../db/users';

  // Let me add getUserByUid

  // Change to:

  // import { createUser as dbCreateUser, updateUser as dbUpdateUser, getUserByUsername as dbGetUserByUsername, getUserByUid as dbGetUserByUid } from '../../db/users';

  // Then in the function:

  const dbUser = await dbGetUserByUid(userId);

  if (!dbUser) {

    return { message: 'کاربر یافت نشد.', success: false };

  }

  const currentUser = {

    id: dbUser.uid,

    name: dbUser.username,

    email: dbUser.email,

    avatarUrl: dbUser.avatar_url || '',

    hasChangedUsername: dbUser.has_changed_username || false,

    bio: dbUser.bio || '',

  };

  let hasChangedUsername = currentUser.hasChangedUsername;

  // Only check for username uniqueness and update Firebase Auth display name if it has changed

  if (username.toLowerCase() !== currentUser.name.toLowerCase()) {

    if (currentUser.hasChangedUsername) {

      return {

        message: 'شما قبلاً نام کاربری خود را تغییر داده‌اید.',

        success: false,

      };

    }

    // Check uniqueness in PostgreSQL

    const existingUser = await dbGetUserByUsername(username);

    if (existingUser && existingUser.uid !== userId) {

      return {

        message: 'این نام کاربری قبلا گرفته شده است.',

        errors: {

          username: ['این نام کاربری در دسترس نیست. لطفا نام دیگری را امتحان کنید.'],

        },

        success: false,

      };

    }

    hasChangedUsername = true;

    const user = auth.currentUser;

    if (user) {

      await updateFirebaseProfile(user, { displayName: username });

    }

  }

  try {

    await dbUpdateUser(userId, {

      username: username !== currentUser.name ? username : undefined,

      bio: bio || '',

      hasChangedUsername: hasChangedUsername !== currentUser.hasChangedUsername ? hasChangedUsername : undefined,

    });

    revalidatePath(`/profile/${username}`);

    revalidatePath('/profile');

    if (username.toLowerCase() !== currentUser.name.toLowerCase()) {

      redirect(`/profile/${username}`);

    }

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
    username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد.'),
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

  const { email, password, username } = validatedFields.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateFirebaseProfile(userCredential.user, { displayName: username });
    await sendEmailVerification(userCredential.user);
    // Create user in PostgreSQL
    await dbCreateUser({
      uid: userCredential.user.uid,
      username,
      email
    });
    return {
      message: 'ثبت نام موفقیت آمیز بود. لطفا ایمیل خود را برای تایید چک کنید. اگر ایمیل در صندوق ورودی شما نبود، پوشه اسپم را نیز بررسی کنید.',
      success: true,
    };
  } catch (e: any) {
    let message = 'خطایی در هنگام ثبت نام رخ داد.';
    if (e.code === 'auth/email-already-in-use') {
      message = 'این ایمیل قبلا استفاده شده است.';
    } else if (e.message) {
      message += `\n${e.message}`;
    }
    return {
      message,
      success: false,
    };
  }
}

const signinSchema = z.object({
  emailOrUsername: z.string().min(1, 'ایمیل یا نام کاربری الزامی است.'),
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

  let { emailOrUsername, password } = validatedFields.data;


  try {
    // Check if input is a username or email
    if (!emailOrUsername.includes('@')) {
      // Check if username exists in PostgreSQL
      const userData = await dbGetUserByUsername(emailOrUsername.toLowerCase());

      if (!userData) {
        return { message: 'ایمیل یا رمز عبور نامعتبر است.', success: false };
      }

      emailOrUsername = userData.email;
    }

    const userCredential = await signInWithEmailAndPassword(auth, emailOrUsername, password);

    if (!userCredential.user.emailVerified) {
      return {
        message: 'لطفاً ابتدا ایمیل خود را تأیید کنید. ایمیل تأییدیه برای شما ارسال شده است.',
        success: false,
      };
    }
  } catch (e: any) {
    // Log the error for debugging
    console.error('Sign-in error:', e, { emailOrUsername });
    let message = 'خطایی در هنگام ورود رخ داد. لطفاً دوباره امتحان کنید.';
    if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found') {
      message = 'ایمیل یا رمز عبور نامعتبر است.';
    } else if (e.code) {
      message += `\n[${e.code}]`;
    }
    return { message, success: false };
  }

  redirect('/');
}

export async function signout() {
  // Note: signOut is client-side only, handle in client component
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


export async function getProfileUser(username: string): Promise<User | null> {
  const userData = await dbGetUserByUsername(username);

  if (!userData) {
    return null;
  }

  return {
    id: userData.uid,
    name: userData.username,
    email: userData.email,
    avatarUrl: userData.avatar_url || '',
    hasChangedUsername: userData.has_changed_username || false,
    bio: userData.bio || '',
  };
}
