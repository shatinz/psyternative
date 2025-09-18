import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const categories = [
  {
    name: 'روان‌گردان‌ها',
    description: 'گزارشات و تجربیات مرتبط با مواد روان‌گردان.',
    href: '/experiences?category=psychedelics',
    imageId: 'psychedelics-landing',
  },
  {
    name: 'رویاها',
    description: 'تجربیات و تحلیل‌های مربوط به دنیای رویا و خواب.',
    href: '/experiences?category=dreams',
    imageId: 'dreams-landing',
  },
  {
    name: 'مدیتیشن',
    description: 'تجربیات حاصل از تمرینات مدیتیشن و ذهن‌آگاهی.',
    href: '/experiences?category=meditation',
    imageId: 'meditation-landing',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-landing');

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="relative mb-16 h-[50vh] w-full overflow-hidden rounded-lg">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="font-headline text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            کشف حالات دگرگون‌شده هوشیاری
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            فضایی برای اشتراک‌گذاری و کاوش در تجربیات روان‌گردان‌ها، رویاها و مدیتیشن.
          </p>
          <Button asChild size="lg" className="font-bold">
            <Link href="/experiences">
              کاوش تجربیات
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-headline text-3xl font-bold text-center mb-8">دسته‌بندی‌ها</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => {
            const categoryImage = PlaceHolderImages.find((img) => img.id === category.imageId);
            return (
              <Link key={category.name} href={category.href} className="group">
                <Card className="h-full transform transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                  <CardHeader>
                    {categoryImage && (
                      <div className="relative h-48 w-full overflow-hidden rounded-t-lg mb-4">
                        <Image
                          src={categoryImage.imageUrl}
                          alt={categoryImage.description}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          data-ai-hint={categoryImage.imageHint}
                        />
                      </div>
                    )}
                    <CardTitle className="font-headline text-2xl">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="text-center bg-card p-8 rounded-lg">
        <h2 className="font-headline text-3xl font-bold mb-4">تجربه خود را به اشتراک بگذارید</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          آیا تجربه‌ای در زمینه حالات دگرگون‌شده هوشیاری دارید؟ آن را با جامعه ما به اشتراک بگذارید و به دیگران در مسیرشان کمک کنید.
        </p>
        <Button asChild>
          <Link href="/experiences/new">
            ثبت تجربه جدید
            <ArrowLeft className="mr-2 h-5 w-5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
