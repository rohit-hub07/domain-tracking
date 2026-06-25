"use client"

import React, { useState, useEffect, Suspense } from "react";
// import axios from "axios";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
// import { useAuth } from "../context/userContext";
import { useAuth } from "../context/userContext";
import Link from "next/link";

function SignupForm() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const authUser = useAuth();
  if (!authUser) return null;
  const { refreshUser, userId, loading, signup } = authUser;

  useEffect(() => {
    if (reason === "auth") {
      toast.error('You must login first!');
      // Clear the URL parameter after showing the toast
      window.history.replaceState({}, '', '/login');
    }
  }, [reason]);

  useEffect(() => {
    if(loading) return
    // Redirect to home if already logged in (only after loading is complete)
    if (!loading && userId) {
      router.push('/home');
    }
  }, [userId, loading, router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await signup({username, email, password })
      console.log("res inside of login page: ", res);
      if(res.success){
        await refreshUser();
        // toast.success(res.data?.message);
        router.push("/home")
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // toast.error(error.response?.data?.message);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-gray-900 to-gray-700 dark:from-gray-50 dark:to-gray-200">
            <svg className="h-7 w-7 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Welcome!</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign Up to continue..</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-900 dark:text-gray-50">
                Username
              </label>
              <input
                onChange={(e) => setUsername(e.target.value)}
                id="username"
                type="text"
                name="username"
                placeholder="johndoe"
                required
                autoComplete="username"
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-50 dark:placeholder:text-gray-500 dark:hover:border-gray-700 dark:focus:border-gray-600 dark:focus:bg-gray-900 dark:focus:ring-gray-50/10"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-gray-50">
                Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-50 dark:placeholder:text-gray-500 dark:hover:border-gray-700 dark:focus:border-gray-600 dark:focus:bg-gray-900 dark:focus:ring-gray-50/10"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 dark:text-gray-50">
                Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-50 dark:placeholder:text-gray-500 dark:hover:border-gray-700 dark:focus:border-gray-600 dark:focus:bg-gray-900 dark:focus:ring-gray-50/10"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900/20 active:scale-95 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:ring-gray-50/20"
            >
              {loading ? "Signing up..": "Sign up"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Alreadyhave an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-gray-900 transition-colors hover:text-gray-700 dark:text-gray-50 dark:hover:text-gray-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-50">Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
