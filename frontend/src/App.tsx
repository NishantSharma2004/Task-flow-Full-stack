import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import CalendarView from "./pages/CalendarView";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import AuthApp from "./AuthApp";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("tf_token");
    const user  = localStorage.getItem("tf_user");
    if (token && user) setIsLoggedIn(true);
    setChecking(false);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "tf_token" && !e.newValue) setIsLoggedIn(false);
      if (e.key === "tf_token" && e.newValue)  setIsLoggedIn(true);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a14", display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316", fontSize: "24px" }}>
        ⚡
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Reset password — always accessible */}
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Auth routes */}
            {!isLoggedIn && (
              <Route path="*" element={<AuthApp onLoginSuccess={() => setIsLoggedIn(true)} />} />
            )}

            {/* App routes */}
            {isLoggedIn && (
              <Route path="*" element={
                <Layout onLogout={() => {
                  localStorage.removeItem("tf_token");
                  localStorage.removeItem("tf_refresh");
                  localStorage.removeItem("tf_user");
                  setIsLoggedIn(false);
                }}>
                  <Routes>
                    <Route path="/"         element={<Index />} />
                    <Route path="/tasks"    element={<Tasks />} />
                    <Route path="/calendar" element={<CalendarView />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="*"         element={<NotFound />} />
                  </Routes>
                </Layout>
              } />
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
