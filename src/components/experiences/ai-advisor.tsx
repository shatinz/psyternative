import { adviseOnExperienceReport } from "@/ai/flows/advise-on-experience-report";
import type { ExperienceReport } from "@/types";
import { AlertCircle, FileText, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";

interface AiAdvisorProps {
  experience: ExperienceReport;
}

const IconMapping = {
  warnings: <AlertTriangle className="h-4 w-4" />,
  cautions: <AlertCircle className="h-4 w-4" />,
  relevantLinks: <LinkIcon className="h-4 w-4" />,
  relatedReports: <FileText className="h-4 w-4" />,
};

export default async function AiAdvisor({ experience }: AiAdvisorProps) {
  const advice = await adviseOnExperienceReport({
    reportText: experience.reportText,
    experienceType: experience.experienceType,
  });

  if (!advice) {
    return null;
  }

  const hasAdvice = 
    advice.warnings?.length > 0 ||
    advice.cautions?.length > 0 ||
    advice.relevantLinks?.length > 0 ||
    advice.relatedReports?.length > 0;

  if (!hasAdvice) return null;

  return (
    <section className="my-12">
      <h2 className="font-headline text-3xl font-bold mb-6">تحلیل هوش مصنوعی</h2>
      <Card className="bg-card/50">
        <CardContent className="p-6 space-y-6">
          {advice.summary && (
            <div>
              <h3 className="font-headline text-xl font-semibold mb-2">خلاصه</h3>
              <p className="text-muted-foreground">{advice.summary}</p>
            </div>
          )}
          
          {advice.warnings && advice.warnings.length > 0 && (
            <div>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>هشدارها</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pr-5 space-y-1">
                    {advice.warnings.map((warning, index) => (
                      <li key={`warn-${index}`}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {advice.cautions && advice.cautions.length > 0 && (
            <div>
              <h3 className="font-headline text-lg font-semibold mb-2 flex items-center gap-2">
                {IconMapping.cautions} ملاحظات
              </h3>
              <ul className="list-disc pr-5 space-y-1 text-muted-foreground">
                {advice.cautions.map((caution, index) => (
                  <li key={`caut-${index}`}>{caution}</li>
                ))}
              </ul>
            </div>
          )}
          
          {advice.relevantLinks && advice.relevantLinks.length > 0 && (
            <div>
              <h3 className="font-headline text-lg font-semibold mb-2 flex items-center gap-2">
                {IconMapping.relevantLinks} لینک‌های مرتبط
              </h3>
              <ul className="list-disc pr-5 space-y-1">
                {advice.relevantLinks.map((link, index) => (
                  <li key={`link-${index}`}>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-accent-foreground/80 hover:underline hover:text-accent-foreground">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {advice.relatedReports && advice.relatedReports.length > 0 && (
            <div>
              <h3 className="font-headline text-lg font-semibold mb-2 flex items-center gap-2">
                {IconMapping.relatedReports} گزارشات مشابه
              </h3>
              <ul className="list-disc pr-5 space-y-1">
                {advice.relatedReports.map((reportId, index) => (
                  <li key={`report-${index}`}>
                    <Link href={`/experiences/${reportId}`} className="text-accent-foreground/80 hover:underline hover:text-accent-foreground">
                       گزارش شماره {reportId}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </CardContent>
      </Card>
    </section>
  );
}
