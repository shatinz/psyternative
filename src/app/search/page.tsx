import ExperienceCard from "@/components/experiences/experience-card";
import { getExperiences } from "@/lib/data";

export default function SearchPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
  };
}) {
  const query = searchParams?.q || "";
  const results = getExperiences(query);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-4xl font-bold mb-8">
        نتایج جستجو برای: <span className="text-primary">&quot;{query}&quot;</span>
      </h1>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg">
          <p className="text-muted-foreground text-lg">
            هیچ نتیجه‌ای برای جستجوی شما یافت نشد.
          </p>
        </div>
      )}
    </div>
  );
}
