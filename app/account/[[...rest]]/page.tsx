"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useSignIn, useSignUp } from "@clerk/nextjs";
import { FcGoogle } from "react-icons/fc";


export default function AccountPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const { isSignedIn, user } = useUser();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const router = useRouter();

  // Redirect if logged in
  useEffect(() => {
    if (isSignedIn && user) {
      const checkAdmin = async () => {
        try {
          setStatusMsg("🔍 Checking if you are an admin...");
          const res = await fetch("/api/check-admin");
          const data = await res.json();

          if (data.isAdmin) {
            setStatusMsg("✅ You are an admin. Redirecting...");
            router.replace("/admin");
          } else {
            setStatusMsg("➡️ Redirecting to homepage...");
            router.replace("/");
          }
        } catch (err) {
          console.error("❌ Error checking admin:", err);
          setStatusMsg("❌ Error occurred. Redirecting...");
          router.replace("/");
        }
      };
      checkAdmin();
    }
  }, [isSignedIn, user, router]);

  if (isSignedIn && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">{statusMsg}</p>
      </div>
    );
  }

  // Handle email/password sign in OR sign up
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      if (mode === "signin") {
        if (!signInLoaded) return;
        const result = await signIn.create({ identifier: email, password });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.replace("/");
        } else {
          setErr("Sign in incomplete.");
        }
      } else {
        if (!signUpLoaded) return;
        await signUp.create({
          emailAddress: email,
          password,
          firstName: name,
        });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setStatusMsg("📧 Verification email sent! Please check your inbox.");
      }
    } catch (e: any) {
      console.error(e);
      setErr(e.errors?.[0]?.message || "Something went wrong.");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      if (mode === "signin") {
        if (!signInLoaded) return;
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/",
        });
      } else {
        if (!signUpLoaded) return;
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/",
        });
      }
    } catch (e: any) {
      setErr(e.errors?.[0]?.message || "Google authentication failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-white px-4">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden w-full max-w-md border border-gray-200">
        {/* Tabs */}
        <div className="flex">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 py-3 font-semibold text-center transition ${mode === "signin"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-3 font-semibold text-center transition ${mode === "signup"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Sign Up
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Google Button */}
          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 mb-6 hover:bg-gray-50 transition"
          >
            <FcGoogle className="text-xl" />
            <span className="font-medium text-gray-700">
              {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-800"
                  required
                />
                <div id="clerk-captcha" className="mb-4" data-cl-theme="light"></div>
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-800"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-800"
              required
            />

            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
            >
              {mode === "signin" ? "Sign In" : "Sign Up"}
            </button>

          </form>

          {/* Errors / Status */}
          {err && (
            <p className="text-center text-sm text-red-600 mt-4">{err}</p>
          )}
          {statusMsg && !err && (
            <p className="text-center text-sm text-gray-500 mt-4">
              {statusMsg}
            </p>
          )}
        </div>
      </div>
    </div>

  );
}
