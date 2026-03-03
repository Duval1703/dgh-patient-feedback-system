import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Users, Stethoscope, Calendar, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const Landing = () => {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">DGH Care</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button variant="healthcare">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
              Empowering Healthcare Through
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Digital Innovation</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Douala General Hospital's comprehensive patient feedback and reminder management system.
              Bridging communication gaps in multilingual healthcare environments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="healthcare" size="lg" className="w-full sm:w-auto">
                  <Stethoscope className="mr-2 h-5 w-5" />
                  Start Your Healthcare Journey
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Comprehensive Healthcare Solutions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides integrated tools for patients, doctors, and administrators to enhance healthcare delivery.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3">Patient Feedback</h3>
                <p className="text-muted-foreground">
                  Multilingual feedback system supporting French, English, and indigenous languages with voice input capabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-secondary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3">Smart Reminders</h3>
                <p className="text-muted-foreground">
                  Automated appointment and medication reminders via SMS and voice calls in multiple languages.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-success mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3">Role-Based Access</h3>
                <p className="text-muted-foreground">
                  Tailored dashboards for patients, doctors, and administrators with appropriate access controls.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">About Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Douala General Hospital is committed to transforming healthcare delivery through innovative digital solutions. 
                Our platform addresses critical communication gaps in Sub-Saharan African healthcare systems.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">Data Privacy & Security</h4>
                    <p className="text-muted-foreground">Enterprise-grade security with role-based access controls.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Heart className="h-6 w-6 text-secondary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">Patient-Centered Care</h4>
                    <p className="text-muted-foreground">Improving patient experience through better communication.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-success mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">Multilingual Support</h4>
                    <p className="text-muted-foreground">Supporting French, English, and indigenous Cameroonian languages.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-none">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Our Inspiration</h3>
                  <blockquote className="text-lg italic text-muted-foreground mb-4">
                    "Healthcare is not about treating diseases, but about healing people. 
                    Technology should bridge the gap between medical expertise and human compassion."
                  </blockquote>
                  <p className="text-sm text-muted-foreground">- DGH Digital Health Initiative</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Transform Healthcare?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of healthcare professionals using our platform to improve patient care.
          </p>
          <Link to="/auth">
            <Button variant="healthcare" size="lg">
              <Heart className="mr-2 h-5 w-5" />
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-card">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">DGH Care</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 Douala General Hospital. Empowering healthcare through digital innovation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;