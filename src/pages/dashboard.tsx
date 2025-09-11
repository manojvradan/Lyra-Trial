// src/pages/dashboard.tsx

import { useSession, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import Image from "next/image";

// --- Import React Icons ---
import {
  FiHome,
  FiStar,
  FiShare2,
  FiSearch,
  FiHelpCircle,
  FiBell,
  FiPlus,
  FiGrid,
  FiList,
  FiClock,
  FiBox,
  FiUpload,
  FiLayout,
} from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";

export default function Dashboard() {
  const { data: sessionData, status } = useSession();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newBaseName, setNewBaseName] = useState("");

  // --- Page Protection Logic ---
  useEffect(() => {
    if (status === "unauthenticated") {
      void router.push("/auth/signin");
    }
  }, [status, router]);

  const { data: bases, isLoading, refetch: refetchBases } = api.base.getAll.useQuery(
    undefined,
    { enabled: !!sessionData?.user },
  );

  const createBase = api.base.create.useMutation({
    onSuccess: () => {
      setNewBaseName("");
      void refetchBases();
    },
  });


  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Airtable Clone</title>
        </Head>
        <div className="flex h-screen bg-white font-sans text-gray-900">
          {/* --- Sidebar --- */}
          <aside className="flex w-64 flex-col border-r border-gray-200 bg-gray-50">
            <div className="flex h-16 items-center border-b border-gray-200 px-4">
               <Image src="/airtable.svg" alt="Airtable Logo" width={40} height={28} />
            </div>
            <nav className="flex-1 space-y-2 p-2">
              <Link href="#" className="flex items-center gap-3 rounded bg-gray-200 px-3 py-2 text-sm font-medium">
                <FiHome className="h-5 w-5" /> Home
              </Link>
              <Link href="#" className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">
                <FiStar className="h-5 w-5" /> Starred
              </Link>
              <Link href="#" className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">
                <FiShare2 className="h-5 w-5" /> Shared
              </Link>
              <div className="pt-2">
                <h3 className="px-3 text-xs font-semibold uppercase text-gray-500">Workspaces</h3>
                <Link href="#" className="mt-1 flex items-center justify-between gap-3 rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">
                  <span>My Workspace</span>
                  <FiPlus className="h-4 w-4" />
                </Link>
              </div>
            </nav>
            <div className="border-t border-gray-200 p-2">
                 <button 
                    onClick={() => {
                        const name = prompt("Enter a name for your new base:");
                        if (name) createBase.mutate({ name });
                    }}
                    disabled={createBase.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                   <FaPlus /> Create
                 </button>
            </div>
          </aside>

          {/* --- Main Content --- */}
          <div className="flex flex-1 flex-col">
            {/* --- Top Bar --- */}
            <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
              <div className="flex items-center">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-96 rounded-md border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FiHelpCircle className="h-6 w-6 text-gray-500 hover:text-gray-800" />
                <FiBell className="h-6 w-6 text-gray-500 hover:text-gray-800" />
                <button onClick={() => void signOut()}>
                    {sessionData.user.image ? (
                        <Image
                            src={sessionData.user.image}
                            alt="User Profile"
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                           {sessionData.user.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </button>
              </div>
            </header>
            
            {/* --- Workspace Content --- */}
            <main className="flex-1 overflow-y-auto bg-white p-8">
              <h1 className="text-3xl font-bold text-gray-800">Home</h1>

              {/* Quick Start Cards */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm">
                  <HiOutlineSparkles className="h-6 w-6 text-purple-600" />
                  <h3 className="mt-2 font-semibold">Start with Omni</h3>
                  <p className="text-sm text-gray-600">Use AI to build a custom app tailored to your workflow.</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm">
                  <FiBox className="h-6 w-6 text-blue-600" />
                  <h3 className="mt-2 font-semibold">Start with templates</h3>
                  <p className="text-sm text-gray-600">Select a template to get started and customize as you go.</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm">
                  <FiUpload className="h-6 w-6 text-green-600" />
                  <h3 className="mt-2 font-semibold">Quickly upload</h3>
                  <p className="text-sm text-gray-600">Easily migrate your existing projects in just a few minutes.</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm">
                  <FiLayout className="h-6 w-6 text-yellow-600" />
                  <h3 className="mt-2 font-semibold">Build an app on your own</h3>
                  <p className="text-sm text-gray-600">Start with a blank app and build your ideal workflow.</p>
                </div>
              </div>
              
              {/* Bases Section */}
              <div className="mt-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <FiClock className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium">Opened anytime</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500">
                    <FiList className="h-5 w-5 hover:text-gray-800" />
                    <FiGrid className="h-5 w-5 text-gray-800" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {isLoading &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-200"></div>
                  ))}
                  {bases?.map((base) => (
                    <Link href={`/base/${base.id}`} key={base.id}
                      className="group block rounded-lg border border-gray-200 p-4 transition hover:border-blue-500 hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-700 text-xl font-bold text-white">
                        {base.name.substring(0, 2)}
                      </div>
                      <h3 className="mt-3 truncate font-semibold group-hover:text-blue-600">{base.name}</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Opened: {base.createdAt.toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  return null;
}