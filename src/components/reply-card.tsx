'use client';

import { useState } from 'react';
import type { Reply } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns-jalali';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { MessageSquareReply, Trash2 } from 'lucide-react';
import NestedReplyForm from './nested-reply-form';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ReplyCardProps {
  reply: Reply;
  postId: string;
}

export default function ReplyCard({ reply, postId }: ReplyCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این پاسخ را حذف کنید؟')) return;

    try {
      const response = await fetch(`/api/posts/${postId}/replies?replyId=${reply.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
        },
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('خطا در حذف پاسخ');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('خطا در حذف پاسخ');
    }
  };

  return (
    <div className="flex flex-col">
      <Card className="bg-background/50">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <Link href={`/profile/${reply.author.name}`} className="flex items-center gap-3 hover:underline flex-grow">
            <Avatar className="h-8 w-8">
              <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} />
              <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex items-baseline gap-2 text-sm">
              <span className="font-semibold">{reply.author.name}</span>
            </div>
          </Link>
          <span className="text-xs text-muted-foreground flex-grow">
            • {formatDistanceToNow(new Date(reply.createdAt as any))} پیش
          </span>
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
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90">{reply.content}</p>
        </CardContent>
        {user && <CardFooter className="py-2 pr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <MessageSquareReply className="ml-2 h-4 w-4" />
            پاسخ
          </Button>
        </CardFooter>}
      </Card>
      
      {showReplyForm && user && (
        <div className="mr-8 mt-4">
          <NestedReplyForm 
            user={user}
            postId={postId}
            parentId={reply.id}
            onSuccess={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {reply.replies && reply.replies.length > 0 && (
        <div className="mr-8 mt-4 space-y-4 border-r-2 border-border pr-4">
          {reply.replies.map(nestedReply => (
            <ReplyCard key={nestedReply.id} reply={nestedReply} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}
