"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, Loader2, AlertCircle, CheckCircle, Video } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";



interface Mention {
  text: string;
  participant: string;
  timestamp: string;
  confidence: number;
  context: string;
}

export default function MonitorPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedConference, setSelectedConference] = useState("");
  const [nameToMonitor, setNameToMonitor] = useState("");
  const [monitoring, setMonitoring] = useState(false);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [error, setError] = useState("");
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check");
      const data = await response.json();
      setAuthenticated(data.authenticated);
      
      if (data.authenticated) {
        // Authenticated
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };



  const startMonitoring = async () => {
    if (!selectedConference || !nameToMonitor) {
      setError("Please select a conference and enter your name");
      return;
    }

    setMonitoring(true);
    setError("");
    setMentions([]);

    // Start polling for mentions
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/meet/monitor?conferenceId=${encodeURIComponent(selectedConference)}&name=${encodeURIComponent(nameToMonitor)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.mentions && data.mentions.length > 0) {
            setMentions(prev => {
              const newMentions = data.mentions.filter(
                (m: Mention) => !prev.some(p => p.timestamp === m.timestamp && p.text === m.text)
              );
              
              // Show browser notification for new mentions
              if (newMentions.length > 0 && "Notification" in window) {
                if (Notification.permission === "granted") {
                  new Notification("Your name was mentioned!", {
                    body: `${newMentions[0].participant}: ${newMentions[0].text.substring(0, 100)}...`,
                    icon: "/favicon.ico"
                  });
                }
              }
              
              return [...newMentions, ...prev];
            });
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 10000); // Poll every 10 seconds

    setPollingInterval(interval);
  };

  const stopMonitoring = () => {
    setMonitoring(false);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 space-y-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto" />
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in with Google to access meeting monitoring
          </p>
          <Link href="/auth/google">
            <Button className="w-full" size="lg">
              Sign in with Google
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Bell className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Meet Monitor</h1>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Setup Monitoring</h2>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="conference">Meeting ID</Label>
                <Input
                  id="conference"
                  type="text"
                  placeholder="e.g., abc-defg-hij"
                  value={selectedConference}
                  onChange={(e) => setSelectedConference(e.target.value)}
                  disabled={monitoring}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the Google Meet conference ID (from the URL)
                </p>
              </div>

              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., John Smith"
                  value={nameToMonitor}
                  onChange={(e) => setNameToMonitor(e.target.value)}
                  disabled={monitoring}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the name to monitor for mentions
                </p>
              </div>

              <div className="flex gap-2">
                {!monitoring ? (
                  <Button
                    onClick={startMonitoring}
                    disabled={!selectedConference || !nameToMonitor}
                    className="flex-1"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Start Monitoring
                  </Button>
                ) : (
                  <Button
                    onClick={stopMonitoring}
                    variant="destructive"
                    className="flex-1"
                  >
                    Stop Monitoring
                  </Button>
                )}
              </div>

              {monitoring && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Monitoring active. You'll be notified when "{nameToMonitor}" is mentioned.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Card>

          {/* Mentions Panel */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Mentions</h2>
              <Badge variant="secondary">{mentions.length} found</Badge>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {mentions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No mentions detected yet</p>
                  <p className="text-sm mt-2">
                    {monitoring ? "Listening for mentions..." : "Start monitoring to detect mentions"}
                  </p>
                </div>
              ) : (
                mentions.map((mention, idx) => (
                  <Card key={idx} className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-sm">{mention.participant}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {mention.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 mb-2">{mention.text}</p>
                    {mention.context !== mention.text && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                        Context: {mention.context}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(mention.timestamp).toLocaleString()}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Important Notes
          </h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
            <li>Transcripts are only available after the meeting has ended</li>
            <li>It may take 15-60 minutes for transcripts to be processed by Google</li>
            <li>Recording must be enabled during the meeting for transcripts to be generated</li>
            <li>Browser notifications will appear when your name is mentioned</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
