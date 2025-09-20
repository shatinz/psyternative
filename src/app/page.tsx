import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { sections } from '@/lib/data';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          به سایترنتیو خوش آمدید
        </h1>
        <p className="mx-auto mt-4 max-w-[700px] text-lg text-muted-foreground md:text-xl">
          فضایی برای کاوش در حالات جایگزین آگاهی: مدیتیشن، روانگردان‌ها، رویاها
          و اتنوبوتانی.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <Link key={section.slug} href={`/sections/${section.slug}`} passHref>
            <Card className="flex h-full transform-gpu flex-col justify-between transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/20">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="rounded-lg bg-primary/10 p-4 text-primary">
                    <section.icon className="h-10 w-10" />
                  </div>
                </div>
                <CardTitle className="text-center font-headline text-2xl">
                  {section.name}
                </CardTitle>
                <CardDescription className="pt-2 text-center">
                  {section.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
