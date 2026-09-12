"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

declare global {
  interface Window {
    google?: any;
  }
}

// Renders Google's real "Sign in with Google" button once a Client ID is
// configured (see README). Until then, it falls back to a demo login so the
// feature is visible and clickable during development/demos — clearly
// labeled so it's never mistaken for real Google auth.
export default function GoogleSignInButton() {
  const btnRef = useRef<HTMLDivElement>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    const handleCredential = async (response: any) => {
      try {
        const res = await api.post("/auth/google", { credential: response.credential });
        setUser(res.data);
        router.push("/");
      } catch (err) {
        console.error("Google sign-in failed:", err);
        alert("Google sign-in failed. Please try again.");
      }
    };

    const renderButton = () => {
      if (!window.google || !btnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        width: 320,
      });
    };

    if (window.google) {
      renderButton();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = renderButton;
      document.body.appendChild(script);
    }
  }, [clientId, router, setUser]);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const res = await api.post("/auth/demo-google");
      setUser(res.data);
      router.push("/");
    } catch (err) {
      console.error("Demo Google login failed:", err);
      alert("Could not sign in. Is the backend server running?");
    } finally {
      setDemoLoading(false);
    }
  };

  if (!clientId) {
    return (
      <div>
        <button
          onClick={handleDemoLogin}
          disabled={demoLoading}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-black/15 bg-black/5 px-6 py-3 font-medium text-bone transition-colors hover:bg-black/10 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.69 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          {demoLoading ? "Signing in…" : "Continue with Google (Demo)"}
        </button>
        <p className="mt-2 text-center text-xs text-bone/30">
          Demo mode — logs into a placeholder account. Add a real Google Client ID to enable actual
          Google Sign-In (see README).
        </p>
      </div>
    );
  }

  return <div ref={btnRef} className="flex justify-center" />;
}
