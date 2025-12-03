"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Video, Sparkles, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">MeetMention</span>
          </div>
          <Link href="/auth/google">
            <Button variant="outline">Sign In</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Never Miss When Your Name is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Mentioned
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              AI-powered monitoring for Google Meet sessions. Get instant notifications when you're mentioned in meetings, even when you're away.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/google">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started Free
              </Button>
            </Link>
            <Link href="/meet/monitor">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Video className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Google Meet Integration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Seamlessly connects with your Google Meet sessions to access transcripts
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Sparkles className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">AI-Powered Detection</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Uses Gemini AI to accurately detect name mentions in context
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Bell className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Real-Time Alerts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Instant notifications when your name appears in meeting transcripts
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Shield className="h-12 w-12 text-orange-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your data is encrypted and never stored permanently
              </p>
            </Card>
          </div>

          {/* How It Works */}
          <div className="mt-20 space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl">
                  1
                </div>
                <h3 className="font-semibold text-xl">Connect Your Account</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Authenticate with Google to access your Meet sessions and transcripts
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-xl">
                  2
                </div>
                <h3 className="font-semibold text-xl">Set Up Monitoring</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter the meeting ID and your name to start monitoring
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-300 font-bold text-xl">
                  3
                </div>
                <h3 className="font-semibold text-xl">Get Notified</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Receive instant alerts whenever your name is mentioned
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>Powered by Google Meet API and Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}