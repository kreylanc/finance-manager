import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label: string;
  isActive?: boolean;
};

const NavButton = ({ href, label, isActive }: Props) => {
  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        "w-full text-primary-foreground outline-none border-none focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground focus:bg-primary-foreground/20 transition",
        isActive ? "bg-white/10 text-primary-foreground" : "bg-transparent"
      )}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
};

export default NavButton;
