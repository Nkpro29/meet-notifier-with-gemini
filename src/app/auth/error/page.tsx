"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    no_code: "No authorization code received from Google",
    token_exchange_failed: "Failed to exchange authorization code for tokens",
    access_denied: "You denied access to the application",
    default: "An unknown error occurred during authentication"
  };

  const message = errorMessages[error || "default"] || errorMessages.default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold">Authentication Failed</h1>
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        </div>

        <div className="space-y-3">
          <Link href="/auth/google">
            <Button className="w-full" size="lg">
              Try Again
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full" size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
