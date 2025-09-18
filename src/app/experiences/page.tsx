import ExperienceCard from "@/components/experiences/experience-card";
import { getExperiences } from "@/lib/data";
import type { ExperienceCategory } from "@/types";

export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams?: {
    category?: ExperienceCategory;
  };
}) {
  const category = searchParams?.category;
  const experiences = await getExperiences(undefined, category);

  const categoryTranslations: Record<string, string> = {
    psychedelics: "روان‌گردان‌ها",
    dreams: "رویاها",
    meditation: "مدیتیشن",
  };

  const pageTitle = category ? `تجربیات: ${categoryTranslations[category]}` : "تمام تجربیات";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-4xl font-bold mb-8">{pageTitle}</h1>
      {experiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg">
          <p className="text-muted-foreground text-lg">
            در این دسته بندی هنوز تجربه‌ای ثبت نشده است.
          </p>
        </div>
      )}
    </div>
  );
}
