import { useEffect, useState } from 'react';
    import { Moon, Sun } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { supabase } from '@/lib/supabase';
    import { useTheme } from '@/components/ThemeProvider';
    import { Separator } from '@/components/ui/separator';
    import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuList } from '@/components/ui/navigation-menu';
    
    export function Header() {
      const [username, setUsername] = useState<string | null>(null);
      const { theme, setTheme } = useTheme();
    
      useEffect(() => {
        async function getProfile() {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', user.id)
              .single();
            if (data) setUsername(data.username);
          }
        }
        getProfile();
      }, []);
    
      const handleSignOut = async () => {
        await supabase.auth.signOut();
      };
    
      return (
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <a href="/journal" className="text-foreground hover:underline">Journal</a>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <a href="/insights" className="text-foreground hover:underline">Insights</a>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <a href="/settings" className="text-foreground hover:underline">Settings</a>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
              </NavigationMenuList>
              <NavigationMenuContent>
                <ul className="space-y-2">
                  <li>
                    <a href="/journal" className="text-foreground hover:underline">Journal</a>
                  </li>
                  <li>
                    <a href="/insights" className="text-foreground hover:underline">Insights</a>
                  </li>
                  <li>
                    <a href="/settings" className="text-foreground hover:underline">Settings</a>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenu>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              {username && (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {username}
                  </span>
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }
