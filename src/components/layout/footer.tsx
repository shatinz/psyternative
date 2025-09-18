import Logo from "../logo";

export default function Footer() {
  return (
    <footer className="bg-secondary/50 border-t mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <div className="flex justify-center items-center mb-2">
          <Logo />
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} رویا ویژن. تمام حقوق محفوظ است.
        </p>
      </div>
    </footer>
  );
}
