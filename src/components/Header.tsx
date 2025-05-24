import { Link } from '@tanstack/react-router'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between w-full">
      <Link to="/" className="ml-4 flex items-center" style={{ minWidth: 48 }}>
        <img src="/logo.png" alt="Vocab Mountain Logo" className="h-10 w-auto" />
      </Link>
      <div className="flex-1 flex justify-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/words" className="font-bold text-lg">
                  Words
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/flashcards" className="font-bold text-lg">
                  Flashcards
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/quiz" className="font-bold text-lg">
                  Quiz
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/matching-game" className="font-bold text-lg">
                  Matching Game
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="mr-4" style={{ minWidth: 48 }} />
    </header>
  )
}
