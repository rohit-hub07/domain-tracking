"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { X, Check, Globe } from "lucide-react";
import { useAuth } from "../context/userContext";
import { useDomain } from "../context/domainContext";

export default function AddDomain() {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  const {userId, loading } = useAuth();
  const { addDomain, showAllDomain } = useDomain();


  useEffect(() => {
    if (!loading && !userId) {
      router.push("/login?reason=auth");
    }
  }, [loading, userId, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSaving || !name.trim()) return;

    try {
      setIsSaving(true);

      const res = await addDomain(name.toLowerCase());

      if (res?.success) {
        await showAllDomain();
        router.push("/home");
      } else {
        toast.error("Failed to add domain.");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900 dark:border-gray-800 dark:border-t-gray-50" />
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => router.push("/home")}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <X size={18} />
              Cancel
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                const form = document.querySelector("form");
                if (form) {
                  (form as HTMLFormElement).requestSubmit();
                }
              }}
              className="flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Save Domain
                </>
              )}
            </button>
          </div>

          <div className="flex border-t border-gray-100 dark:border-gray-900">
            <div className="flex items-center gap-2 border-b-2 border-black py-3 text-sm font-semibold dark:border-white">
              <Globe size={18} />
              Domain Name
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto flex max-w-5xl gap-10 px-6 py-10">
        {/* Sticky Form */}
        <div className="sticky top-36 w-full h-fit">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <label
              htmlFor="name"
              className="mb-3 block text-xs font-semibold uppercase tracking-wider text-gray-400"
            >
              Enter Domain URL
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="example.com"
              maxLength={200}
              autoFocus
              required
              className="w-full border-none bg-transparent text-5xl font-bold tracking-tight outline-none placeholder:text-gray-300 dark:text-white dark:placeholder:text-gray-600"
            />
          </form>
        </div>
      </div>
    </div>
  );
}