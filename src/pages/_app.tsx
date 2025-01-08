import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuthForm } from "@/components/auth/AuthForm";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { GlobalStateProvider } from "@/lib/global-state";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // React Router v6
import { cn } from "@/lib/utils";

function App({ Component, pageProps }: any) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GlobalStateProvider>
      <ThemeProvider defaultTheme="system" storageKey="journal-theme">
        <BrowserRouter>
          <div
            className={cn(
              "min-h-screen bg-background flex flex-col",
              isAuthenticated ? "" : "items-center justify-center"
            )}
          >
            {isAuthenticated ? (
              <>
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<Component {...pageProps} />} />
                    {/* Add other routes here as needed */}
                  </Routes>
                </main>
                <Toaster />
              </>
            ) : (
              <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                  <h1 className="text-4xl font-bold tracking-tight">
                    AI Journal
                  </h1>
                  <p className="mt-2 text-lg text-muted-foreground">
                    Your personal AI-powered journaling companion
                  </p>
                </div>
                <AuthForm />
              </div>
            )}
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </GlobalStateProvider>
  );
}

export default App;
