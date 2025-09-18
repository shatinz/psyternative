import ExperienceForm from "@/components/experiences/experience-form";

export default function NewExperiencePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold">ثبت تجربه جدید</h1>
        <p className="text-muted-foreground mt-2">
          تجربه خود را با جامعه رویا ویژن به اشتراک بگذارید.
        </p>
      </div>
      <ExperienceForm />
    </div>
  );
}
