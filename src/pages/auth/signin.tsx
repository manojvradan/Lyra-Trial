// src/pages/auth/signin.tsx

import type { GetServerSidePropsContext, InferGetServerSidePropsType, NextApiRequest, NextApiResponse  } from "next";
import type { ClientSafeProvider } from "node_modules/next-auth/lib/client";
import { getProviders, signIn } from "next-auth/react";
import Image from "next/image";
import Head from "next/head";
import { FcGoogle } from "react-icons/fc";

// This is the correct v5 import for server-side session logic
import { auth } from "~/server/auth"; 

export default function SignIn({ providers }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Sign in to Airtable Clone</title>
        <meta name="description" content="Sign in to your Airtable Clone account" />
      </Head>
      <div className="flex min-h-screen">
        <div className="relative hidden w-1/2 flex-col items-center justify-center bg-gray-50 lg:flex">
          <Image
            src="/login-graphic.jpg"
            alt="Airtable Clone Graphic"
            layout="fill"
            objectFit="cover"
            priority
          />
          <div className="absolute inset-0 bg-blue-900 opacity-20" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center bg-white p-8">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <Image
                src="/airtable.svg"
                alt="Airtable Clone Logo"
                width={100}
                height={50}
                className="mx-auto"
              />
            </div>
            <h2 className="text-center text-2xl font-bold text-gray-800">
              Welcome back
            </h2>
            <p className="mb-8 mt-2 text-center text-sm text-gray-600">
              Sign in to your account
            </p>
            
            {(Object.values(providers) as ClientSafeProvider[]).map((provider) => (
              provider.name === "Google" && (
                <div key={provider.id}>
                  <button
                    onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
                    className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <FcGoogle size={24} />
                    Continue with Google
                  </button>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Use the central `auth` handler to get the session
  const session = await auth(
    context.req as NextApiRequest, 
    context.res as NextApiResponse
  );

  // If the user is already logged in, redirect them.
  if (session) {
    return { redirect: { destination: "/dashboard" } };
  }

  // `getProviders` works the same way, but now our session logic is correct.
  const providers = await getProviders();

  return {
    // We return the providers, or an empty object if there are none.
    props: { providers: providers ?? {} },
  };
}