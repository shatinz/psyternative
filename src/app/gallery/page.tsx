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
           گالری فعلا در دسترس نیست 
        </p>

      </header>

      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold">Gallery is not available</h2>
        <p className="mt-4 text-muted-foreground">Will open soon</p>
      </div>
    </div>
  );
}
