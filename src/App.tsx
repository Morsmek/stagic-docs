import { Route, Routes } from "react-router";
import { HomePage } from "@/components/home/HomePage";
import { AppShell } from "@/components/layout/AppShell";
import { NotFound } from "@/components/layout/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/theme";
import { ToolPage } from "@/pages/ToolPage";

export default function App() {
  return (
    <ThemeProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools/:toolId" element={<ToolPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
      <Toaster />
    </ThemeProvider>
  );
}
