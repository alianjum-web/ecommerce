// components/auth/AuthLogin.tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/sonner"
import { useState } from "react"
import { useAppDispatch } from "@/store/hooks"
import { loginUser } from "@/store/auth-slice"
// Define the AuthLoginProps type
import { UserRole } from '@/utils/auth';

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})


type AuthLoginProps = {
  redirect?: string;
  requiredRole?: UserRole;
};

export default function AuthLogin({ redirect = "/shopping/home", requiredRole }: AuthLoginProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const resultAction = await dispatch(loginUser(values));
      
      if (loginUser.fulfilled.match(resultAction)) {
        const userData = resultAction.payload as { user?: { role: string } };
        
        if (requiredRole && userData.user?.role !== requiredRole) {
          router.push(`/app/unauth-page?returnUrl=${encodeURIComponent(redirect)}`);
          return;
        }
        
        // Handle redirect more safely
        let finalRedirect = redirect;
        if (!redirect.startsWith('/app')) {
          finalRedirect = `/app${redirect.startsWith('/') ? redirect : `/${redirect}`}`;
        }
        
        router.push(finalRedirect);
        router.refresh();
        toast.success("Login successful");
      } else {
        throw new Error(typeof resultAction.payload === 'string' ? resultAction.payload : "Login failed");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed")
      console.error("Login error:", error)
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