import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "./ui/navigation-menu";

const Navbar = () => {
  return (
    <div className="container bg-background/80 fixed z-20 inset-x-0 top-0 h-10 mx-auto flex w-full justify-between items-center md:px-0 px-10">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href={"/"}>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <h1 className="text-2xl">Prateek Singh</h1>
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href={"/writings/life/journey-so-far"}>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <h1 className="text-xl">Writings</h1>
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center space-x-1">
        <ModeToggle />
      </div>
    </div>
  );
};

export default Navbar;
