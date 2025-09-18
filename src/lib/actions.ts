"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { summarizeExperienceReport } from "@/ai/flows/summarize-experience-reports";
import { addComment, createExperience } from "./data";

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

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { summary } = await summarizeExperienceReport({
      report: validatedFields.data.reportText,
    });

    const newExperience = {
      ...validatedFields.data,
      summary,
    };

    const created = createExperience(newExperience);
    revalidatePath("/experiences");
    redirect(`/experiences/${created.id}`);
  } catch (error) {
    console.error("Failed to create experience:", error);
    return {
      errors: {
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
  prevState: any,
  formData: FormData
) {
    const validatedFields = commentSchema.safeParse({
        text: formData.get('text'),
        experienceId: formData.get('experienceId'),
    });

    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        addComment(validatedFields.data.experienceId, {
            text: validatedFields.data.text,
        });
        revalidatePath(`/experiences/${validatedFields.data.experienceId}`);
        return {
            errors: {}
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
