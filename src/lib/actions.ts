
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addComment, createExperience } from "./data";
import { summarizeExperienceReport } from "@/ai/flows/summarize-experience-reports";

const experienceSchema = z.object({
  title: z.string().min(3, "عنوان باید حداقل ۳ حرف داشته باشد."),
  reportText: z.string().min(50, "متن تجربه باید حداقل ۵۰ حرف داشته باشد."),
  experienceType: z.enum(["psychedelics", "dreams", "meditation"], {
    errorMap: () => ({ message: "لطفا یک دسته بندی معتبر انتخاب کنید." }),
  }),
});

export async function createExperienceAction(
  prevState: { errors: { _form: string[] } },
  formData: FormData
): Promise<{ errors: { _form: string[] } }> {
  const validatedFields = experienceSchema.safeParse({
    title: formData.get("title"),
    reportText: formData.get("reportText"),
    experienceType: formData.get("experienceType"),
  });

  if (!validatedFields.success) {
    return {
      errors: {
        ...prevState.errors,
        ...validatedFields.error.flatten().fieldErrors,
      }
    };
  }

  try {
    const summaryResult = await summarizeExperienceReport({ report: validatedFields.data.reportText });

    const newExperience = {
      ...validatedFields.data,
      summary: summaryResult.summary,
    };

    const created = await createExperience(newExperience);

    if (!created?.id) {
       return {
        errors: {
          ...prevState.errors,
          _form: ["شیء تجربه ایجاد شد اما شناسه ای دریافت نکرد."],
        },
      };
    }

    revalidatePath("/experiences");
    revalidatePath("/");
    redirect(`/experiences/${created.id}`);
  } catch (error) {
    console.error("An unexpected error occurred in createExperienceAction:", error);
    return {
      errors: {
        ...prevState.errors,
        _form: ["خطایی در هنگام ایجاد تجربه رخ داد. لطفا دوباره تلاش کنید."],
      },
    };
  }
}

const commentSchema = z.object({
  text: z.string().min(1, "متن نظر نمیتواند خالی باشد."),
  experienceId: z.string(),
});

export async function addCommentAction(
  prevState: { errors: { _form: string[] } },
  formData: FormData
) {
    const validatedFields = commentSchema.safeParse({
        text: formData.get('text'),
        experienceId: formData.get('experienceId'),
    });

    if(!validatedFields.success) {
        return {
            errors: {
              ...prevState.errors,
              ...validatedFields.error.flatten().fieldErrors,
            }
        }
    }

    try {
        await addComment(validatedFields.data.experienceId, {
            text: validatedFields.data.text,
        });
        revalidatePath(`/experiences/${validatedFields.data.experienceId}`);
        return {
            errors: { _form: [] }
        }
    } catch (error) {
        console.error("Failed to add comment:", error);
        return {
            errors: {
                ...prevState.errors,
                _form: ['خطایی در هنگام ارسال نظر رخ داد. لطفا دوباره تلاش کنید.']
            }
        }
    }
}
