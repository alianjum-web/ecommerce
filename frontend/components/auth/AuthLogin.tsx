"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { useState } from "react";

interface AuthLoginProps {
  redirect?: string;
}

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function AuthLogin({ redirect = "/" }: AuthLoginProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const requiredRole = searchParams.get('requiredRole');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Only check role if requiredRole is specified
      if (requiredRole) {
        const userData = await fetch('/api/auth/me');
        if (!userData.ok) {
          throw new Error('Failed to fetch user data');
        }
        const user = await userData.json();
        
        if (user.role !== requiredRole) {
          router.push(`/unauth-page?returnUrl=${encodeURIComponent(redirect)}`);
          return;
        }
      }

      router.push(redirect);
      router.refresh();
      toast.success("Login successful");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Enter your email and password to login
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@example.com" 
                      {...field} 
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}          
          <a href="/auth/register" className="underline hover:text-primary">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}