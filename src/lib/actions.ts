
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addComment, createExperience } from "./data";
import type { ExperienceReport } from "@/types";
import { UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "./firebase-admin";

const experienceSchema = z.object({
  title: z.string().min(3, "عنوان باید حداقل ۳ حرف داشته باشد."),
  reportText: z.string().min(50, "متن تجربه باید حداقل ۵۰ حرف داشته باشد."),
  experienceType: z.enum(["psychedelics", "dreams", "meditation"], {
    errorMap: () => ({ message: "لطفا یک دسته بندی معتبر انتخاب کنید." }),
  }),
});

export async function createExperienceAction(
  prevState: any,
  formData: FormData
) {
  const validatedFields = experienceSchema.safeParse({
    title: formData.get("title"),
    reportText: formData.get("reportText"),
    experienceType: formData.get("experienceType"),
  });
  
  const idToken = formData.get("idToken") as string;
  
  if (!idToken) {
    return {
      errors: { _form: ["You must be logged in to create an experience."] },
    };
  }

  if (!adminApp) {
    return { errors: { _form: ["Firebase Admin SDK not initialized."] } };
  }

  let decodedToken;
  try {
    decodedToken = await getAuth(adminApp).verifyIdToken(idToken);
  } catch (error) {
    return { errors: { _form: ["Invalid authentication token. Please log in again."] } };
  }

  const authorName = decodedToken.name || decodedToken.email || "Anonymous";

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      ran: false,
    };
  }

  let newExperience: ExperienceReport | null = null;
  try {
    const summary = validatedFields.data.reportText.substring(0, 100) + "...";

    const experienceData = {
      ...validatedFields.data,
      summary: summary,
      author: authorName
    };

    newExperience = await createExperience(experienceData);

    if (!newExperience?.id) {
       return {
        errors: {
          _form: ["شیء تجربه ایجاد شد اما شناسه ای دریافت نکرد."],
        },
        ran: true,
      };
    }

  } catch (error) {
    console.error("An unexpected error occurred in createExperienceAction:", error);
    return {
      errors: {
        _form: ["خطایی در هنگام ایجاد تجربه رخ داد. لطفا دوباره تلاش کنید."],
      },
      ran: true,
    };
  }
  
  revalidatePath("/experiences");
  revalidatePath("/");
  redirect(`/experiences/${newExperience.id}`);
}

const commentSchema = z.object({
  text: z.string().min(1, "متن نظر نمیتواند خالی باشد."),
  experienceId: z.string(),
});

export async function addCommentAction(
  prevState: any,
  formData: FormData
) {
    const validatedFields = commentSchema.safeParse({
        text: formData.get('text'),
        experienceId: formData.get('experienceId'),
    });
    
    const idToken = formData.get("idToken") as string;
    if (!idToken) {
      return { errors: { _form: ["You must be logged in to comment."] } };
    }

    if (!adminApp) {
      return { errors: { _form: ["Firebase Admin SDK not initialized."] } };
    }

    let decodedToken;
    try {
      decodedToken = await getAuth(adminApp).verifyIdToken(idToken);
    } catch (error) {
      return { errors: { _form: ["Invalid authentication token. Please log in again."] } };
    }
    const authorName = decodedToken.name || decodedToken.email || "Anonymous";


    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        await addComment(validatedFields.data.experienceId, {
            text: validatedFields.data.text,
            author: authorName,
        });
        revalidatePath(`/experiences/${validatedFields.data.experienceId}`);
        return {
            errors: { }
        }
    } catch (error) {
        console.error("Failed to add comment:", error);
        return {
            errors: {
                _form: ['خطایی در هنگام ارسال نظر رخ داد. لطفا دوباره تلاش کنید.']
            }
        }
    }
}


const authSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

async function firebaseAuthAction(
  formData: FormData,
  action: "signUp" | "signIn"
): Promise<{ errors: any, ran: boolean }> {
  const validatedFields = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, ran: true };
  }

  try {
    let userCredential: UserCredential;
    if (action === "signUp") {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        validatedFields.data.email,
        validatedFields.data.password
      );
    } else {
      userCredential = await signInWithEmailAndPassword(
        auth,
        validatedFields.data.email,
        validatedFields.data.password
      );
    }
    
    return { errors: {}, ran: true };

  } catch (error: any) {
    console.error(`Firebase ${action} error:`, error);
    let errorMessage = "An unexpected error occurred. Please try again.";
    if (error.code) {
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered.";
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/weak-password":
          errorMessage = "The password is too weak.";
          break;
        case "auth/configuration-not-found":
          errorMessage = "Authentication is not enabled in your Firebase project. Please enable Email/Password sign-in in the Firebase console.";
          break;
        default:
          errorMessage = "Authentication failed. Please try again.";
      }
    }
    return {
      errors: {
        _form: [errorMessage],
      },
      ran: true
    };
  }
}

export async function signUpAction(prevState: any, formData: FormData) {
  const result = await firebaseAuthAction(formData, "signUp");
  return result;
}

export async function signInAction(prevState: any, formData: FormData) {
  const result = await firebaseAuthAction(formData, "signIn");
  return result;
}
