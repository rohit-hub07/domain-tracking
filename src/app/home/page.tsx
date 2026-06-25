"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/userContext";
import { useDomain } from "../context/domainContext";
import Link from "next/link";

export interface IDomain {
  _id: string;
  name: string;
  registrar: string;
  registration: string;
  expiry: string;
  userId: string;
}

export default function Page() {
  const router = useRouter();
  const [domainData, setDomainData] = useState<IDomain[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { userId, loading: authLoading,logout } = useAuth();
  const { showAllDomain, deleteDomain } = useDomain();

  const calculateRemainingDays = (expiryDateString: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDateString);
    expiry.setHours(0, 0, 0, 0);

    const differenceInTime = expiry.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    return differenceInDays;
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await showAllDomain();
      if (res?.success) {
        console.log("Data inside of home of show: ", res);
        setDomainData(res?.domains ?? []);
      }
    } catch (error) {
      console.log(error);
      setDomainData([]);
    }
  }, [showAllDomain]);


  useEffect(() => {
    if (authLoading) return;

    if (userId) {
      fetchData();
    } else {
      router.push("/login");
    }
  }, [userId, authLoading, router, fetchData]);

  const handleDeleteClick = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDomain(id);
      setDomainData((prevDomains) =>
        prevDomains ? prevDomains.filter((domain) => domain._id !== id) : null
      );
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Responsive Header Layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">My Domains</h1>
        <button onClick={async() => await logout()} className="w-full sm:w-auto text-center bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition text-sm">
          Logout
        </button>

        <Link href="/newdomain" className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition text-sm">
          + Add Domain
        </Link>
      </div>

      {domainData === null ? (
        <p className="text-gray-400">Loading domains...</p>
      ) : domainData.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl p-8 sm:p-12 text-center border border-zinc-800">
          <p className="text-gray-400 mb-4">No domains added yet.</p>
          <Link href="/newdomain" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm">
            Add First Domain
          </Link>
        </div>
      ) : (
        <>
          {/* 📱 MOBILE VIEW: Renders as card rows (Hidden on Medium screens and up) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {domainData.map((domain) => {
              const daysRemaining = calculateRemainingDays(domain.expiry);
              return (
                <div key={domain._id} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{domain.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">via {domain.registrar}</p>
                    </div>
                    {/* Status Badge */}
                    {daysRemaining < 0 ? (
                      <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        Expired
                      </span>
                    ) : daysRemaining <= 30 ? (
                      <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                        Expiring Soon
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        Active
                      </span>
                    )}
                  </div>

                  <hr className="border-zinc-100" />

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-600">
                    <div>
                      <p className="text-gray-400">Registered</p>
                      <p className="font-medium text-gray-800">{new Date(domain.registration).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Expiration</p>
                      <p className="font-medium text-gray-800">{new Date(domain.expiry).toLocaleDateString()}</p>
                    </div>
                    <div className="col-span-2 pt-1">
                      <p className="text-gray-400">Time Remaining</p>
                      <p className="font-semibold text-sm text-gray-900 mt-0.5">
                        {daysRemaining > 0 ? `${daysRemaining} days` : daysRemaining === 0 ? "Expires today" : "Expired"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleDeleteClick(domain._id)}
                      disabled={deletingId === domain._id}
                      className="w-full bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 py-2 rounded-lg font-medium text-sm border border-red-200 transition disabled:opacity-50"
                    >
                      {deletingId === domain._id ? "Deleting..." : "Delete Domain"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 💻 DESKTOP VIEW: Full Structured Data Table (Hidden on Mobile screens) */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 border-b border-zinc-200">
                  <tr className="text-gray-700 text-sm">
                    <th className="px-6 py-4 text-left font-semibold">Domain</th>
                    <th className="px-6 py-4 text-left font-semibold">Registrar</th>
                    <th className="px-6 py-4 text-left font-semibold">Registration</th>
                    <th className="px-6 py-4 text-left font-semibold">Expiry</th>
                    <th className="px-6 py-4 text-center font-semibold">Remaining Days</th>
                    <th className="px-6 py-4 text-center font-semibold">Status</th>
                    <th className="px-6 py-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {domainData.map((domain) => {
                    const daysRemaining = calculateRemainingDays(domain.expiry);
                    return (
                      <tr key={domain._id} className="border-b border-zinc-100 last:border-none hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5 font-semibold text-gray-900">{domain.name}</td>
                        <td className="px-6 py-5 text-gray-700">{domain.registrar}</td>
                        <td className="px-6 py-5 text-gray-700">
                          {new Date(domain.registration).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5 text-gray-700">
                          {new Date(domain.expiry).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5 text-center font-medium text-gray-900">
                          {daysRemaining > 0 ? `${daysRemaining} days` : daysRemaining === 0 ? "Expires today" : "Expired"}
                        </td>
                        <td className="px-6 py-5 text-center">
                          {daysRemaining < 0 ? (
                            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                              Expired
                            </span>
                          ) : daysRemaining <= 30 ? (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                              Expiring Soon
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleDeleteClick(domain._id)}
                              disabled={deletingId === domain._id}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition text-xs font-medium disabled:bg-red-400"
                            >
                              {deletingId === domain._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}