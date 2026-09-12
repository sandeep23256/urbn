"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-ink/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-lg font-900 tracking-tightest text-bone sm:text-xl">
          URBN <span className="gradient-text">Lab</span>
        </Link>

        {/* Desktop links — hidden below md, replaced by the hamburger menu */}
        <div className="hidden gap-8 font-body text-sm text-bone/80 md:flex">
          <Link href="/shop" className="transition-colors hover:text-coral">Shop</Link>
          <Link href="/wishlist" className="transition-colors hover:text-coral">Wishlist</Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="transition-colors hover:text-coral">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-bone sm:gap-5">
          <Link href="/cart" className="relative transition-colors hover:text-coral">
            Cart
            {itemCount > 0 && (
              <span className="ml-1 rounded-full bg-coral px-1.5 py-0.5 text-xs text-ink">{itemCount}</span>
            )}
          </Link>

          {/* Sign in / account stays visible on all sizes */}
          <div className="hidden sm:flex sm:items-center sm:gap-5">
            {user ? (
              <>
                <Link href="/account" className="transition-colors hover:text-coral">{user.name.split(" ")[0]}</Link>
                <button onClick={handleLogout} className="text-bone/60 transition-colors hover:text-coral">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="rounded-md bg-electric px-4 py-1.5 text-white transition-colors hover:bg-electric/80">
                Sign in
              </Link>
            )}
          </div>

          {/* Hamburger — only below md */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span className={`block h-0.5 w-5 bg-bone transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-bone transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-bone transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className="border-t border-black/10 bg-ink px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm text-bone/80">
            <Link href="/shop" onClick={closeMenu} className="hover:text-coral">Shop</Link>
            <Link href="/wishlist" onClick={closeMenu} className="hover:text-coral">Wishlist</Link>
            {user?.role === "admin" && (
              <Link href="/admin" onClick={closeMenu} className="hover:text-coral">Admin</Link>
            )}
            <div className="border-t border-black/10 pt-4">
              {user ? (
                <div className="flex items-center justify-between">
                  <Link href="/account" onClick={closeMenu} className="text-bone hover:text-coral">
                    {user.name.split(" ")[0]}'s account
                  </Link>
                  <button onClick={handleLogout} className="text-bone/60 hover:text-coral">
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="inline-block rounded-md bg-electric px-4 py-1.5 text-white"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
