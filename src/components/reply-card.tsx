import type { Reply } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns-jalali';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader } from './ui/card';

interface ReplyCardProps {
  reply: Reply;
}

export default function ReplyCard({ reply }: ReplyCardProps) {
  return (
    <Card className="bg-background/50">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} />
          <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex items-baseline gap-2 text-sm">
          <span className="font-semibold">{reply.author.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(reply.createdAt)} پیش
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90">{reply.content}</p>
      </CardContent>
    </Card>
  );
}
