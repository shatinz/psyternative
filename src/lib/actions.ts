
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addComment, createExperience, createUserProfile, isUsernameUnique, getUserByUsername } from "./data";
import type { ExperienceReport } from "@/types";
import { UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
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

  const authorId = decodedToken.uid;
  const authorUsername = (await getUserByUsername(decodedToken.uid))?.username || 'unknown';

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
      authorId: authorId,
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
  if(authorUsername) revalidatePath(`/profile/${authorUsername}`);
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
    const authorId = decodedToken.uid;

    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        await addComment(validatedFields.data.experienceId, {
            text: validatedFields.data.text,
            authorId: authorId,
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
): Promise<{ errors: any, ran: boolean, user?: UserCredential }> {
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
      
      const username = validatedFields.data.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      const isUnique = await isUsernameUnique(username);
      const finalUsername = isUnique ? username : `${username}-${Date.now()}`;

      await createUserProfile(userCredential.user.uid, {
        email: validatedFields.data.email,
        username: finalUsername,
        displayName: finalUsername,
        createdAt: new Date(),
      });
      
      await getAuth(adminApp).setCustomUserClaims(userCredential.user.uid, { username: finalUsername });

    } else {
      userCredential = await signInWithEmailAndPassword(
        auth,
        validatedFields.data.email,
        validatedFields.data.password
      );
    }
    
    return { errors: {}, ran: true, user: userCredential };

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
        case "auth/popup-closed-by-user":
          errorMessage = "Sign-in process was cancelled.";
          break;
        case "auth/account-exists-with-different-credential":
            errorMessage = "An account already exists with the same email address but different sign-in credentials. Try signing in with a different provider.";
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

const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters long."),
  username: z.string().min(3, "Username must be at least 3 characters long.").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
});

export async function updateProfileAction(prevState: any, formData: FormData) {
  const idToken = formData.get("idToken") as string;
  if (!idToken) return { errors: { _form: ["Authentication required."] } };

  if (!adminApp) {
    return { errors: { _form: ["Firebase Admin SDK not initialized."] } };
  }

  let decodedToken;
  try {
    decodedToken = await getAuth(adminApp).verifyIdToken(idToken);
  } catch (error) {
    return { errors: { _form: ["Invalid authentication token."] } };
  }
  
  const currentUsername = (await getUserProfile(decodedToken.uid))?.username;

  const validatedFields = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    username: formData.get("username"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { displayName, username } = validatedFields.data;
  const uid = decodedToken.uid;

  if (username !== currentUsername) {
    const isUnique = await isUsernameUnique(username);
    if (!isUnique) {
      return { errors: { username: ["This username is already taken."] } };
    }
  }

  try {
    await adminApp.firestore().collection("users").doc(uid).update({
      displayName,
      username,
    });
    await getAuth(adminApp).setCustomUserClaims(uid, { username: username });

     revalidatePath(`/profile/${username}`);
     if(currentUsername) revalidatePath(`/profile/${currentUsername}`);
     return { success: true, errors: {}, newUsername: username };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { errors: { _form: ["Failed to update profile."] } };
  }
}
