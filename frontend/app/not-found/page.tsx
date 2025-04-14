"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Head from 'next/head';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 8000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>404 Not Found | Your Site Name</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Head>

      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 text-center">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="min-w-[150px]"
          >
            Go Back
          </Button>
          <Button asChild className="min-w-[150px]">
            <Link href="/">Return Home</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          You&apos;ll be automatically redirected to the homepage in a few seconds...
        </p>
      </div>
    </>
  );
}