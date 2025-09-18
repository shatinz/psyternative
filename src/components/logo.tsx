import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("font-headline text-2xl font-bold text-primary", className)}>
      رویا ویژن
    </Link>
  );
}
