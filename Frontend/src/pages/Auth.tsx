import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  user_role: string;
  name?: string;
  first_name?: string;
  specialty?: string; // Added specialty for doctors
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields for login
    if (isLogin && (!formData.email || !formData.password)) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both email and password.",
      });
      return;
    }

    // Validate password match and required fields for registration
    if (!isLogin && (formData.password !== formData.confirmPassword || !formData.email || !formData.firstName || !formData.lastName || !formData.phoneNumber)) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: formData.password !== formData.confirmPassword ? "Passwords do not match." : "Please fill in all required fields.",
      });
      return;
    }

    // Admin login will be handled by the unified authentication flow below

    setIsLoading(true);
    try {
      if (isLogin) {
        // Authenticate using the unified login endpoint for doctors and patients
        const response = await fetch(`${backendUrl}/auth/token`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Invalid email or password");
        }

        const data: LoginResponse = await response.json();
        
        // Check if user is deactivated
        if (data.user_role === "doctor" || data.user_role === "patient") {
          try {
            const userEndpoint = data.user_role === "doctor" 
              ? `/doctor/${data.user_id}`
              : `/patients/${data.user_id}`;
              
            const userResponse = await fetch(`${backendUrl}${userEndpoint}`, {
              headers: {
                "Authorization": `Bearer ${data.access_token}`,
                "Accept": "application/json"
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              const isActive = data.user_role === "doctor" ? userData.is_active : userData.is_active;
              
              if (!isActive) {
                throw new Error("Your account has been deactivated. Please contact support for assistance.");
              }
            }
          } catch (error: any) {
            if (error.message.includes("deactivated")) {
              throw error;
            }
            // If there's another error checking status, we'll continue with login
            console.error("Error checking user status:", error);
          }
        }

        // Store authentication data
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('userRole', data.user_role);
        localStorage.setItem('userId', data.user_id.toString());
        localStorage.setItem('userName', data.first_name || data.name || '');
        localStorage.setItem('user_name', data.first_name || data.name || '');

        if (data.user_role === "admin") {
          toast({
            title: "Welcome Admin!",
            description: "Redirecting to admin dashboard.",
          });
          navigate('/dashboard/admin');
        } else if (data.user_role === "doctor") {
          // Store email explicitly for doctors
          localStorage.setItem('doctorEmail', formData.email);
          
          // Fetch doctor profile data immediately after login
          try {
            const profileRes = await fetch(`${backendUrl}/doctor/profile`, {
              headers: {
                "Authorization": `Bearer ${data.access_token}`,
                "Accept": "application/json"
              }
            });
            
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              // Store doctor-specific information
              localStorage.setItem('doctorId', profileData.id.toString());
              localStorage.setItem('doctorName', profileData.name);
              localStorage.setItem('doctorSpecialty', profileData.specialty);
              
              // Store user object for consistency
              const user = {
                id: profileData.id,
                name: profileData.name,
                specialty: profileData.specialty,
                email: formData.email,
                role: 'doctor'
              };
              localStorage.setItem('user', JSON.stringify(user));
            }
          } catch (profileError) {
            console.error("Error fetching doctor profile:", profileError);
          }
          
          toast({
            title: "Welcome Doctor!",
            description: "You have been signed in.",
          });
          navigate('/dashboard/doctor');
        } else if (data.user_role === "patient") {
          toast({
            title: "Welcome back!",
            description: "You have been signed in.",
          });
          navigate('/dashboard/patient');
        } else {
          throw new Error(`Unknown user role: ${data.user_role}`);
        }
      } else {
        // Registration for patients (unchanged)
        const response = await fetch(`${backendUrl}/auth/patient`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phoneNumber,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Registration failed");
        }

        toast({
          title: "Account created!",
          description: "Please sign in to continue.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isLogin ? "Sign-in Failed" : "Registration Failed",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">DGH Care</span>
            <ThemeToggle />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin 
              ? "Sign in to access your healthcare dashboard" 
              : "Join our healthcare community"
            }
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? "Sign In" : "Sign Up"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      placeholder="+237 XXX XXX XXX"
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                </div>
              )}

              <Button type="submit" variant="healthcare" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <Button variant="link" className="ml-1 p-0" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "Sign up" : "Sign in"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Available in: English • Français • Douala • Bassa • Ewondo
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;