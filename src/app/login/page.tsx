"use client";

import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GoogleIcon = () => (
  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white shadow mr-3">
    <svg className="h-4 w-4" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#34A853" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#FBBC05" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
      <path fill="#EA4335" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.591,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
  </span>
);

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Animate card entrance
    const timeout = setTimeout(() => setShowCard(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  const handleSignIn = async () => {
    if (!auth) {
      toast({
        title: "Configuration Error",
        description: "Firebase is not configured. Please add your credentials in src/lib/firebase.ts",
        variant: "destructive",
      });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      console.error("Error signing in with Google", error);
      toast({
        title: "Sign-in Error",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 animate-gradient-x">
        <Loader2 className="h-8 w-8 animate-spin text-blue-200" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 animate-gradient-x p-4">
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease-in-out infinite;
        }
      `}</style>
      <Card
        className={`w-full max-w-sm border-0 shadow-2xl rounded-3xl bg-black/40 backdrop-blur-md transition-all duration-700 ${showCard ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} `}
        style={{ boxShadow: '0 8px 32px 0 rgba(49, 46, 129, 0.28)' }}
      >
        <CardHeader className="text-center">
          <div className="flex flex-col items-center mb-2">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-900/80 shadow-lg mb-2">
              <span className="text-4xl font-extrabold text-blue-300">G</span>
            </span>
            <CardTitle className="text-2xl font-bold tracking-tight text-blue-100">GradeCal</CardTitle>
          </div>
          <CardDescription className="text-sm text-blue-200/80">Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignIn}
            className="w-full py-5 font-semibold text-base bg-white/90 hover:bg-blue-100 text-gray-900 border-0 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            style={{ boxShadow: '0 2px 8px 0 rgba(49, 46, 129, 0.18)' }}
          >
            <GoogleIcon />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
      <div className="mt-8 text-xs text-blue-200 text-center drop-shadow-sm">
        Built by Manohar Gella &mdash; Your GPA, simplified.
      </div>
    </div>
  );
}
