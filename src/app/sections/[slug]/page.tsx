'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import { sections } from '@/lib/data';
import PostCard from '@/components/post-card';
import PostForm from '@/components/post-form';
import { Separator } from '@/components/ui/separator';
import type { Post } from '@/lib/types';

export default function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = React.use(params);
  const section = sections.find(s => s.slug === unwrappedParams.slug);
  if (!section) {
    notFound();
  }

  const [sectionPosts, setSectionPosts] = React.useState<Post[]>([]);
  React.useEffect(() => {
    fetch(`/api/posts?section=${unwrappedParams.slug}`)
      .then(res => res.json())
      .then(data => setSectionPosts(data.map((post: any) => ({ ...post, createdAt: new Date(post.createdAt) }))));
  }, [unwrappedParams.slug]);

  if (section.slug === 'gallery') {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8 text-center">
          <div className="inline-block rounded-lg bg-primary/10 p-4 text-primary">
            <section.icon className="h-12 w-12" />
          </div>
          <h1 className="mt-4 font-headline text-4xl font-bold">
            {section.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {section.description}
          </p>
        </header>

        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">Gallery is not available</h2>
          <p className="mt-4 text-muted-foreground">Will open soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 text-center">
        <div className="inline-block rounded-lg bg-primary/10 p-4 text-primary">
          <section.icon className="h-12 w-12" />
        </div>
        <h1 className="mt-4 font-headline text-4xl font-bold">
          {section.name}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {section.description}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {sectionPosts.length > 0 ? (
            sectionPosts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
              <p className="text-muted-foreground">
                هنوز هیچ پستی در این بخش وجود ندارد. اولین نفر باشید!
              </p>
            </div>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <PostForm sectionSlug={section.slug} />
          </div>
        </aside>
      </div>
    </div>
  );
}
