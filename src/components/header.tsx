'use client';

import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { signout } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from './ui/skeleton';

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-headline text-2xl font-bold text-foreground"
        >
          <BrainCircuit className="h-7 w-7 text-primary" />
          <span>سایترنتیو</span>
        </Link>

        <div className="flex items-center gap-4">
          {loading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/50">
                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile portrait" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">پروفایل</Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>تنظیمات</DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={signout}>
                  <DropdownMenuItem asChild>
                    <button type="submit" className="w-full text-right">
                      خروج
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/signin">ورود</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">ثبت نام</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
