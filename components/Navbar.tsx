'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Clear search when navigating to home
  useEffect(() => {
    if (pathname === '/') {
      setSearchQuery('');
    }
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(!session){
      router.push('/login');
      return;
    }
    if (searchQuery.trim()) {
      router.push(`/?email=${encodeURIComponent(searchQuery)}`);
    }
  };


  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Visitar otro usuario"
            className="p-2 rounded"
          />
          <button type="submit" className="text-white hover:underline bg-gray-700 p-2 rounded">
            Buscar
          </button>
        </form>
        <div className="flex items-center space-x-4 ml-auto">
          <div className="text-white ">
            <Link href="/">Home</Link>
          </div>
          {status === "authenticated" ? (
            <>
            <div className="text-white ">
              <Link href="/crear">Crear Marcador</Link>
            </div>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
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