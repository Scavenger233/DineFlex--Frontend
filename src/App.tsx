import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RestaurantDetail from "./pages/RestaurantDetail";
import BookingConfirmation from "./pages/BookingConfirmation";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Footer from "./components/Footer";
import OAuthRedirect from "./pages/OAuthRedirect";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="pt-24 flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/booking/:id" element={<BookingConfirmation />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/oauth2/redirect" element={<OAuthRedirect />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;
