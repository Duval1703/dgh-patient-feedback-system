import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Heart } from "lucide-react";
import { useTranslation } from "@/context/TranslationContext";
import LanguageSelector from "./LanguageSelector";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "patient" | "doctor" | "admin";
  userName: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userRole, userName }) => {
  const { translate } = useTranslation();

  // Function to get role-specific dashboard path
  const getRoleDashboardPath = () => {
    switch (userRole) {
      case "patient":
        return "/patient";
      case "doctor":
        return "/doctor";
      case "admin":
        return "/admin";
      default:
        return "/";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to={getRoleDashboardPath()} className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">DGH Care</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Add Language Selector here */}
            <LanguageSelector />
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">{userName}</span>
            <Link to="/auth">
              <Button variant="outline" size="sm">
                {translate("Log Out")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-background">
        <div className="container mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          {translate("© 2024 Douala General Hospital. All rights reserved.")}
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;