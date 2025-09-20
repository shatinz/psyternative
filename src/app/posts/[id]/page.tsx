import { posts, mockUser } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns-jalali';
import Image from 'next/image';
import ReplyCard from '@/components/reply-card';
import { Separator } from '@/components/ui/separator';
import { MessageCircle } from 'lucide-react';
import ReplyForm from '@/components/reply-form';

export default function PostPage({ params }: { params: { id: string } }) {
  const post = posts.find(p => p.id === params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="mb-4 font-headline text-4xl font-extrabold leading-tight tracking-tighter lg:text-5xl">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{post.author.name}</span>
            </div>
            <span>•</span>
            <time dateTime={post.createdAt.toISOString()}>
              {format(post.createdAt, 'd MMMM yyyy')}
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
          <p>{post.content}</p>
        </div>
      </article>

      <Separator className="my-12" />

      <section className="space-y-8">
        <h2 className="flex items-center gap-2 font-headline text-2xl font-bold">
          <MessageCircle className="h-6 w-6" />
          <span>پاسخ‌ها ({post.replies.length})</span>
        </h2>
        <div className="space-y-6">
          {post.replies.map(reply => (
            <ReplyCard key={reply.id} reply={reply} />
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      <ReplyForm postId={post.id} />
    </div>
  );
}
