"use client";

import { usePathname, useRouter } from "next/navigation";
import NavButton from "./nav-button";
import { useMedia } from "react-use";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";

const routes = [
  {
    href: "/",
    label: "Overview",
  },
  {
    href: "/transactions",
    label: "Transactions",
  },
  {
    href: "/accounts",
    label: "Accounts",
  },
  {
    href: "/categories",
    label: "Categories",
  },
  {
    href: "/settings",
    label: "Settings",
  },
];

const Navigation = () => {
  // use state for mobile navigation
  const [isOpen, setIsOpen] = useState(false);

  // get current pathname
  const pathname = usePathname();
  const router = useRouter();

  const isMobile = useMedia("(max-width: 1024px)", false);

  const onClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-primary-foreground/15 text-primary-foreground outline-none border-none focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground focus:bg-primary-foreground/20 transitio"
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="px-2">
          <nav className="flex flex-col gap-y-2 pt-6">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                onClick={() => onClick(route.href)}
                className="justify-start w-full"
              >
                {route.label}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <nav className="hidden items-center p-2 gap-x-2 overflow-x-auto lg:flex ">
      {routes.map((nav) => (
        <NavButton
          key={nav.href}
          href={nav.href}
          label={nav.label}
          isActive={pathname === nav.href}
        />
      ))}
    </nav>
  );
};

export default Navigation;
