import type { ExperienceReport } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface ExperienceCardProps {
  experience: ExperienceReport;
}

const categoryDetails = {
    psychedelics: { label: "روان‌گردان", variant: "default" as const },
    dreams: { label: "رویا", variant: "secondary" as const },
    meditation: { label: "مدیتیشن", variant: "outline" as const },
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
    const { label, variant } = categoryDetails[experience.experienceType];
    const formattedDate = new Date(experience.createdAt).toLocaleDateString("fa-IR");

  return (
    <Card className="flex flex-col h-full transition-shadow duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
            <CardTitle className="font-headline text-xl mb-1">
                <Link href={`/experiences/${experience.id}`} className="hover:text-primary transition-colors">
                    {experience.title}
                </Link>
            </CardTitle>
            <Badge variant={variant}>{label}</Badge>
        </div>
        <CardDescription>
          توسط <Link href={`/profile/${experience.author}`} className="hover:underline text-muted-foreground/90">{experience.author}</Link> در {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{experience.summary}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link" className="p-0 h-auto">
            <Link href={`/experiences/${experience.id}`}>
                بیشتر بخوانید
                <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
