"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Play,
  ArrowRight,
  Users,
  Calendar,
  Mail,
  Globe,
  Camera,
  Check,
  Settings,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { submitEmailSignup } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const features = [
  {
    title: "Simple Member Management",
    description: "Keep track of your congregation with an easy-to-use member directory. Perfect for small churches.",
    icon: Users,
    color: "text-violet-500",
  },
  {
    title: "Focus on Ministry",
    description: "We handle all the technical details so you can dedicate your time to what matters most - your community.",
    icon: Settings,
    color: "text-blue-500",
  },
  {
    title: "Share Your Story",
    description: "A welcoming digital presence that authentically reflects your church's heart for community.",
    icon: Globe,
    color: "text-emerald-500",
  },
];

export default function HomePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const testToast = () => {
    toast({
      title: "Test Toast",
      description: "This is a test notification",
      variant: "default",
    });
  };

  async function handleEmailSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitEmailSignup({ email });

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message || "Thanks for signing up!",
          variant: "success",
          duration: 5000,
        });
        setEmail("");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to sign up. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex flex-col">
      <Button onClick={testToast} className="absolute top-4 right-4">
        Test Toast
      </Button>

      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-background px-4">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:60px_60px]" />
        <div className="container relative z-10 max-w-screen-xl mx-auto py-20 md:py-32">
          <div className="mx-auto flex max-w-[800px] flex-col items-center justify-center space-y-10 text-center">
            <div className="space-y-6">
              <h1 className="text-balance leading-[1.3] pb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
                Nurture Community, Not Technology
              </h1>
              <p className="mx-auto max-w-[700px] text-balance leading-relaxed text-lg text-muted-foreground md:text-xl">
                Coming soon: A simple allplatform that lets you focus on what matters most - 
                building authentic relationships and fostering meaningful connections in your congregation.
              </p>
            </div>
            
            {/* Email Signup Form */}
            <div className="w-full max-w-md">
              <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing up..." : "Get Updates"}
                </Button>
              </form>
              <p className="mt-2 text-sm text-muted-foreground">
                Be the first to know when we launch
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative overflow-hidden bg-muted/50 px-4">
        <div className="container max-w-screen-xl mx-auto py-20 md:py-32">
          <div className="mx-auto flex max-w-[800px] flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Built for Real Community
            </h2>
            <p className="max-w-[600px] text-balance text-lg text-muted-foreground">
              Simple tools that support authentic relationships and meaningful connections, 
              not complicated systems that get in the way.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card 
                key={feature.title} 
                className="relative flex flex-col overflow-hidden transition-colors hover:bg-muted/50"
              >
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-balance">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Digital Presence Section */}
      <section id="digital-presence" className="relative overflow-hidden bg-background px-4">
        <div className="container max-w-screen-xl mx-auto py-20 md:py-32">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                  Focus on Your Community
                </h2>
                <p className="text-balance text-lg text-muted-foreground">
                  Stop spending time managing technology. We'll handle your digital presence 
                  so you can invest in what matters most - your people and your mission.
                </p>
                <ul className="space-y-4 text-muted-foreground">
                  {[
                    "Professionally managed website that stays current",
                    "Automatic updates and maintenance handled for you",
                    "Best-in-class security and performance",
                    "Expert support when you need it"
                  ].map((item) => (
                    <li key={item} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="relative grid grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4 md:space-y-6">
                <div className="aspect-square overflow-hidden rounded-xl bg-muted/80" />
                <div className="aspect-square overflow-hidden rounded-xl bg-muted/80" />
              </div>
              <div className="space-y-4 pt-8 md:space-y-6 md:pt-12">
                <div className="aspect-square overflow-hidden rounded-xl bg-muted/80" />
                <div className="aspect-square overflow-hidden rounded-xl bg-muted/80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-primary px-4 text-primary-foreground">
        <div className="container max-w-screen-xl mx-auto py-20 md:py-32">
          <div className="mx-auto flex max-w-[800px] flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                Stay Updated
              </h2>
              <p className="mx-auto max-w-[600px] text-balance text-lg text-primary-foreground/80 md:text-xl">
                Sign up to be notified when we launch and get early access.
              </p>
            </div>
            <div className="w-full max-w-md">
              <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/90 text-primary"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  {isSubmitting ? "Signing up..." : "Get Updates"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
