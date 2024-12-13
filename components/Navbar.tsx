'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold">
          <Link href="/">Home</Link>
        </div>
        <div className="flex items-center space-x-4 ml-auto">
          <Link href="/log" className="text-white hover:underline">
            Logs
          </Link>
          {status === "authenticated" ? (
            <>
              <button
                onClick={() => signOut({ redirect: false })}
                className="text-white hover:underline"
              >
                Logout
              </button>
              <span className="text-white">{session!.user?.name}</span>
              {session.user?.image && (
                <img
                  src={session!.user!.image}
                  alt={session.user.name || "User Avatar"}
                  className="w-8 h-8 rounded-full"
                />
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:underline">
                Login
              </Link>
              <Link href="/registro" className="text-white hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}