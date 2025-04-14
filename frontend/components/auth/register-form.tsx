"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterFormData } from "@/validations/register";
import { registerUser } from "@/store/auth-slice";
import { useAppDispatch } from "@/store/hooks";
import { FormInput } from "../common/form-input";

export default function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(data: RegisterFormData) {
    setIsSubmitting(true);

    try {
      const result = await dispatch(
        registerUser({
          userName: data.userName,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        })
      ).unwrap();

      if (result) {
        toast.success("Operation Successful", {
          description: "Registration successful!",
        });
        router.push("/auth/login?registered=true");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";

      toast.error("Registration failed", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
          >
            Login
          </Link>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput<RegisterFormData>
            control={form.control}
            name="userName"
            label="Username"
            placeholder="Enter your username"
          />
          
          <FormInput<RegisterFormData>
            control={form.control}
            name="email"
            label="Email"
            placeholder="Enter your email"
            type="email"
          />
          
          <FormInput<RegisterFormData>
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
          />
          
          <FormInput<RegisterFormData>
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            type="password"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </Form>
    </div>
  );
}