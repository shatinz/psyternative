import { mockUser } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import Image from 'next/image';
import ReplyCard from '@/components/reply-card';
import { Separator } from '@/components/ui/separator';
import { MessageCircle } from 'lucide-react';
import ReplyForm from '@/components/reply-form';
import Link from 'next/link';
import type { Post } from '@/lib/types';
import { getPostById } from '../../../../db/posts';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const postWithDate = { ...post, createdAt: new Date(post.createdAt) };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="mb-4 font-headline text-4xl font-extrabold leading-tight tracking-tighter lg:text-5xl">
            {postWithDate.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href={`/profile/${postWithDate.author.name}`} className="flex items-center gap-2 hover:underline">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={postWithDate.author.avatarUrl}
                  alt={postWithDate.author.name}
                />
                <AvatarFallback>{postWithDate.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{postWithDate.author.name}</span>
            </Link>
            <span>•</span>
<time dateTime={postWithDate.createdAt.toISOString()}>
  {format(postWithDate.createdAt, 'd MMMM yyyy', { locale: faIR })}
</time>
          </div>
        </header>

        <Image
          src="https://picsum.photos/seed/postbg/1200/400"
          alt="Abstract background"
          data-ai-hint="galaxy nebula"
          width={1200}
          height={400}
          className="mb-8 rounded-lg object-cover"
        />

        <div className="prose prose-invert max-w-none text-lg text-foreground/90 prose-headings:font-headline prose-p:leading-relaxed">
          <p>{postWithDate.content}</p>
        </div>
      </article>

      <Separator className="my-12" />

      <section className="space-y-8">
        <h2 className="flex items-center gap-2 font-headline text-2xl font-bold">
          <MessageCircle className="h-6 w-6" />
          <span>پاسخ‌ها ({postWithDate.replies.length})</span>
        </h2>
        <div className="space-y-6">
          {postWithDate.replies.map(reply => (
            <ReplyCard key={reply.id} reply={reply} postId={postWithDate.id} />
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      <ReplyForm postId={postWithDate.id} />
    </div>
  );
}
