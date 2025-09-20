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
import { MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns-jalali';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card className="flex flex-col transition-all hover:border-primary/50">
      <CardHeader>
        <Link href={`/posts/${post.id}`}>
          <CardTitle className="font-headline text-xl leading-snug hover:text-primary">
            {post.title}
          </CardTitle>
        </Link>
        <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{post.author.name}</span>
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
