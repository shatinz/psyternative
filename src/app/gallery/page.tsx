import { arts } from '@/lib/data';
import ArtCard from '@/components/art-card';
import ArtForm from '@/components/art-form';
import { Palette } from 'lucide-react';

export default function GalleryPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 text-center">
        <div className="inline-block rounded-lg bg-primary/10 p-4 text-primary">
          <Palette className="h-12 w-12" />
        </div>
        <h1 className="mt-4 font-headline text-4xl font-bold">گالری هنر</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          بازاری برای خرید و فروش آثار هنری و صنایع دستی اعضای جامعه.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <main className="space-y-6 lg:col-span-2">
           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {arts.map(art => (
              <ArtCard key={art.id} art={art} />
            ))}
          </div>
        </main>

        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <ArtForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
