"use client";

import type { Comment } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useFormState, useFormStatus } from "react-dom";
import { addCommentAction } from "@/lib/actions";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useEffect, useRef } from "react";

interface CommentsSectionProps {
  experienceId: string;
  comments: Comment[];
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} size="sm">
            {pending ? "در حال ارسال..." : "ارسال نظر"}
        </Button>
    )
}

export default function CommentsSection({ experienceId, comments }: CommentsSectionProps) {
  const [state, formAction] = useFormState(addCommentAction, { errors: {} });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if(!state.errors || Object.keys(state.errors).length === 0){
        formRef.current?.reset();
    }
  }, [state]);

  return (
    <section>
      <h2 className="font-headline text-3xl font-bold mb-6">نظرات ({comments.length})</h2>
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">نظر خود را بنویسید</CardTitle>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="experienceId" value={experienceId} />
                    <div className="space-y-2">
                        <Label htmlFor="comment-text" className="sr-only">متن نظر</Label>
                        <Textarea id="comment-text" name="text" placeholder="نظر شما..." rows={4} />
                        {state.errors?.text && <p className="text-sm text-destructive">{state.errors.text[0]}</p>}
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>

        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="bg-card/50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-bold">{comment.author}</CardTitle>
                      <CardDescription>
                        {new Date(comment.createdAt).toLocaleDateString("fa-IR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">{comment.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            هنوز نظری ثبت نشده است. اولین نفر باشید!
          </p>
        )}
      </div>
    </section>
  );
}
