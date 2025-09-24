'use client';

import Link from 'next/link';
import type { Post } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns-jalali';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟')) return;

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
        },
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('خطا در حذف پست');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('خطا در حذف پست');
    }
  };
  return (
    <Card className="flex flex-col transition-all hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <Link href={`/posts/${post.id}`} className="flex-grow">
            <CardTitle className="font-headline text-xl leading-snug hover:text-primary">
              {post.title}
            </CardTitle>
          </Link>
          {user?.isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
          <Link href={`/profile/${post.author.name}`} className="flex items-center gap-2 hover:underline">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{post.author.name}</span>
          </Link>
          <span>•</span>
          <span>{formatDistanceToNow(post.createdAt)} پیش</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-3 text-muted-foreground">
          {post.content}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          <span>{post.replies.length} پاسخ</span>
        </div>
        <Link
          href={`/posts/${post.id}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          ادامه مطلب
        </Link>
      </CardFooter>
    </Card>
  );
}
