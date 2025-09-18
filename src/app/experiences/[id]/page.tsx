import AiAdvisor from "@/components/experiences/ai-advisor";
import CommentsSection from "@/components/experiences/comments-section";
import { Badge } from "@/components/ui/badge";
import { getExperienceById } from "@/lib/data";
import { notFound } from "next/navigation";

export default function ExperienceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const experience = getExperienceById(params.id);

  if (!experience) {
    notFound();
  }

  const categoryDetails = {
    psychedelics: { label: "روان‌گردان", variant: "default" as const },
    dreams: { label: "رویا", variant: "secondary" as const },
    meditation: { label: "مدیتیشن", variant: "outline" as const },
  };

  const { label, variant } = categoryDetails[experience.experienceType];
  const formattedDate = new Date(experience.createdAt).toLocaleDateString("fa-IR", {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <article className="mb-12">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
              {experience.title}
            </h1>
            <Badge variant={variant} className="text-sm">{label}</Badge>
          </div>
          <p className="text-muted-foreground">
            توسط {experience.author} در {formattedDate}
          </p>
        </header>
        <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-foreground/90 font-body">
          <p style={{whiteSpace: 'pre-wrap'}}>{experience.reportText}</p>
        </div>
      </article>

      <AiAdvisor experience={experience} />

      <CommentsSection experienceId={experience.id} comments={experience.comments} />
    </div>
  );
}
