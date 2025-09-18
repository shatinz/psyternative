
"use client";

import { Search, Menu, LogOut, UserPlus, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Logo from "../logo";
import { cn } from "@/lib/utils";
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navLinks = [
  { href: "/", label: "خانه" },
  { href: "/experiences", label: "تجربیات" },
  { href: "/experiences/new", label: "ثبت تجربه" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, loading } = useAuth();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    if (query) {
      router.push(`/search?q=${query}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
    setIsMenuOpen(false);
  }

  const AuthNav = () => {
    if (loading) return null;

    if (user) {
      return (
        <Button onClick={handleLogout} variant="ghost" size="sm">
          <LogOut className="ml-2 h-4 w-4" />
          خروج
        </Button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">
            <LogIn className="ml-2 h-4 w-4" />
            ورود
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">
            <UserPlus className="ml-2 h-4 w-4" />
            ثبت نام
          </Link>
        </Button>
      </div>
    );
  };
  
  const MobileAuthNav = () => {
    if (loading) return null;

    if (user) {
      return (
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-lg">
          <LogOut className="ml-2 h-5 w-5" />
          خروج
        </Button>
      );
    }

    return (
      <>
        <Link
            href="/login"
            className="text-lg text-muted-foreground transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
        >
            <LogIn className="ml-2 inline h-5 w-5" />
            ورود
        </Link>
        <Link
            href="/signup"
            className="text-lg text-muted-foreground transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
        >
            <UserPlus className="ml-2 inline h-5 w-5" />
            ثبت نام
        </Link>
      </>
    );
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex relative w-full max-w-sm items-center">
            <Input
              type="search"
              name="q"
              placeholder="جستجو..."
              className="pr-10 h-9"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9 text-muted-foreground"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <div className="hidden md:flex">
             <AuthNav />
          </div>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
               <SheetHeader className="text-left">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
               </SheetHeader>
              <div className="flex flex-col h-full p-6 pt-0">
                <div className="mb-8 mt-6">
                  <Logo />
                </div>
                <nav className="flex flex-col gap-6 text-lg font-medium">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "transition-colors hover:text-primary",
                        pathname === link.href ? "text-primary" : "text-muted-foreground"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                 <div className="mt-6 flex flex-col gap-6">
                    <MobileAuthNav />
                 </div>
                <form onSubmit={handleSearch} className="mt-8 relative w-full items-center">
                  <Input
                    type="search"
                    name="q"
                    placeholder="جستجو..."
                    className="pr-10 h-10"
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 text-muted-foreground"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
