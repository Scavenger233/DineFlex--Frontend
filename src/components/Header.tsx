import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { loginCustomer, registerCustomer } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const GOOGLE_LOGIN_URL = `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "")}/oauth2/authorization/google`;

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, login, logout } = useAuth();

  // Handle scroll events to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.querySelector("#email") as HTMLInputElement).value;
    const password = (form.querySelector("#password") as HTMLInputElement)
      .value;

    try {
      const res = await loginCustomer({ customerEmail: email, password });
      toast({
        title: "Login successful!",
        description: `Welcome back, ${res.customerName}`,
      });
      // Optionally: save customer info or token
      login(
        {
          customerName: res.customerName,
          customerEmail: res.customerEmail,
          customerPhone: res.phone,
        },
        res.token,
      );
      setAuthDialogOpen(false); // Then close modal

      // Redirect to main page
      navigate("/");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.response?.data?.message || "Invalid credentials.",
        variant: "destructive",
      });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;

    // Works for both desktop and mobile
    const nameInput =
      form.querySelector("#register-name") ||
      form.querySelector("#register-name-mobile");
    const emailInput =
      form.querySelector("#register-email") ||
      form.querySelector("#register-email-mobile");
    const passwordInput =
      form.querySelector("#register-password") ||
      form.querySelector("#register-password-mobile");
    const phoneInput =
      form.querySelector("#register-phone") ||
      form.querySelector("#register-phone-mobile");

    const customerName = (nameInput as HTMLInputElement)?.value || "";
    const customerEmail = (emailInput as HTMLInputElement)?.value || "";
    const password = (passwordInput as HTMLInputElement)?.value || "";
    const phone = (phoneInput as HTMLInputElement)?.value || "";

    try {
      await registerCustomer({ customerName, customerEmail, password, phone });

      toast({
        title: "Registration successful!",
        description: `You can now log in to your account.`,
      });

      // Automatically switch to login tab
      setActiveTab("login");
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.response?.data?.message || "Please check your input.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You’ve been signed out.",
    });
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white shadow-md py-2"
          : "bg-white/80 backdrop-blur-sm py-4",
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center group">
          <h1 className="text-dineflex-burgundy text-3xl font-bold transition-transform duration-300 group-hover:scale-105">
            Dine<span className="text-dineflex-gold">Flex</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex gap-8">
            <li>
              <Link
                to="/"
                className={cn(
                  "font-medium text-dineflex-charcoal hover:text-dineflex-burgundy transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-dineflex-burgundy after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100",
                  location.pathname === "/" &&
                    "text-dineflex-burgundy after:scale-x-100",
                )}
              >
                Restaurants
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={cn(
                  "font-medium text-dineflex-charcoal hover:text-dineflex-burgundy transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-dineflex-burgundy after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100",
                  location.pathname === "/about" &&
                    "text-dineflex-burgundy after:scale-x-100",
                )}
              >
                About
              </Link>
            </li>
          </ul>

          {/* Auth Dialog */}
          <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className="text-dineflex-burgundy font-semibold">
                  Welcome, {currentUser.customerName}
                </span>
                <Button
                  variant="outline"
                  className="border-dineflex-burgundy text-dineflex-burgundy hover:bg-dineflex-burgundy hover:text-white transition-colors"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-dineflex-burgundy text-dineflex-burgundy hover:bg-dineflex-burgundy hover:text-white transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  <span>Sign In</span>
                </Button>
              </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl">
                  Account Access
                </DialogTitle>
                <DialogDescription className="text-center">
                  Sign in or create a new account to make reservations
                </DialogDescription>
              </DialogHeader>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mt-4"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <div className="space-y-4">
                    <Button
                      onClick={() => (window.location.href = GOOGLE_LOGIN_URL)}
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                          Or
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" required />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-dineflex-burgundy hover:bg-dineflex-burgundy/90"
                    >
                      Sign In
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="register">
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input
                        id="register-name"
                        placeholder="John Smith"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Phone Number</Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="+353 87 123 4567"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input id="register-password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">
                        Confirm Password
                      </Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-dineflex-gold hover:bg-dineflex-gold/90 text-dineflex-charcoal"
                    >
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-dineflex-burgundy text-dineflex-burgundy hover:bg-dineflex-burgundy hover:text-white transition-colors"
              >
                <User className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl">
                  Account Access
                </DialogTitle>
                <DialogDescription className="text-center">
                  Sign in or create a new account to make reservations
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="login" className="mt-4">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <div className="space-y-4">
                    <Button
                      onClick={() => (window.location.href = GOOGLE_LOGIN_URL)}
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                          Or
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-mobile">Email</Label>
                      <Input
                        id="email-mobile"
                        type="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-mobile">Password</Label>
                      <Input id="password-mobile" type="password" required />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-dineflex-burgundy hover:bg-dineflex-burgundy/90"
                    >
                      Sign In
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="register">
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name-mobile">Full Name</Label>
                      <Input
                        id="register-name-mobile"
                        placeholder="John Smith"
                        required
                      />
                      <div className="space-y-2">
                        <Label htmlFor="register-phone-mobile">Phone</Label>
                        <Input
                          id="register-phone-mobile"
                          placeholder="+353 87 123 4567"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email-mobile">Email</Label>
                      <Input
                        id="register-email-mobile"
                        type="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password-mobile">Password</Label>
                      <Input
                        id="register-password-mobile"
                        type="password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password-mobile">
                        Confirm Password
                      </Label>
                      <Input
                        id="register-confirm-password-mobile"
                        type="password"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-dineflex-gold hover:bg-dineflex-gold/90 text-dineflex-charcoal"
                    >
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md absolute top-full left-0 right-0 animate-fade-in">
          <nav className="container mx-auto px-4 py-4">
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  to="/"
                  className={cn(
                    "block py-2 font-medium text-dineflex-charcoal hover:text-dineflex-burgundy transition-colors",
                    location.pathname === "/" && "text-dineflex-burgundy",
                  )}
                >
                  Restaurants
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={cn(
                    "block py-2 font-medium text-dineflex-charcoal hover:text-dineflex-burgundy transition-colors",
                    location.pathname === "/about" && "text-dineflex-burgundy",
                  )}
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
