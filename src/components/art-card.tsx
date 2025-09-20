import Image from 'next/image';
import type { Art } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';

interface ArtCardProps {
  art: Art;
}

export default function ArtCard({ art }: ArtCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/20">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={art.imageUrl}
            alt={art.title}
            fill
            className="object-cover"
            data-ai-hint="handicraft art"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-2 font-headline text-xl leading-snug">
          {art.title}
        </CardTitle>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {art.description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={art.seller.avatarUrl} alt={art.seller.name} />
            <AvatarFallback>{art.seller.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{art.seller.name}</span>
        </div>
        <div className="font-headline text-lg font-bold text-primary">
          {art.price.toLocaleString('fa-IR')} تومان
        </div>
      </CardFooter>
      <div className="p-4 pt-0">
        <Button className="w-full">
            <ShoppingCart className="ml-2 h-5 w-5" />
            افزودن به سبد خرید
        </Button>
      </div>
    </Card>
  );
}
