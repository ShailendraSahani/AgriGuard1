'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Sprout,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User,
} from 'lucide-react';

export function Navbar() {
  const { data: session, status } = useSession();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/lands', label: 'Lands' },
    { href: '/packages', label: 'Packages' },
  ];

  // ✅ Sticky Shadow on Scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-xl border-b border-green-200'
            : 'bg-white/70 backdrop-blur-md border-b border-green-100'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* ✅ Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center 
              bg-gradient-to-br from-green-500 to-yellow-500 shadow-md"
            >
              <Sprout className="h-5 w-5 text-white" />
            </motion.div>

            <h1 className="text-xl font-extrabold bg-gradient-to-r 
            from-green-600 to-yellow-500 bg-clip-text text-transparent">
              AgriGuard
            </h1>
          </Link>

          {/* ✅ Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-gray-700 hover:text-green-600 transition"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* ✅ Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {status === 'loading' ? (
              <div className="h-5 w-5 rounded-full border-2 border-green-500 border-t-yellow-500 animate-spin" />
            ) : session ? (
              <div className="relative">

                {/* ✅ Profile Button */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl 
                  bg-green-100 hover:bg-green-200 transition text-green-800 font-semibold"
                >
                  <User className="h-4 w-4" />
                  {session.user?.name}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* ✅ Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-52 rounded-2xl 
                      bg-white shadow-xl border border-green-100 overflow-hidden"
                    >
                      <Link
                        href={`/${session.user?.role}/dashboard`}
                        className="flex items-center gap-2 px-4 py-3 text-sm 
                        font-semibold text-gray-700 hover:bg-green-50 transition"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 text-green-600" />
                        Dashboard
                      </Link>

                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm 
                        font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-xl text-sm font-semibold 
                  bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm transition"
                >
                  Log In
                </Link>

                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold
                  bg-green-500 hover:bg-green-600 text-white shadow-sm transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ✅ Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-green-100 text-green-700 
            hover:bg-green-200 transition"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/90 backdrop-blur-xl border-t border-green-100"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl font-semibold text-gray-700
                  hover:bg-gradient-to-r hover:from-green-500 hover:to-yellow-500
                  hover:text-white transition"
                >
                  {item.label}
                </Link>
              ))}

              {!session && (
                <>
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-semibold text-gray-700
                    hover:bg-gradient-to-r hover:from-green-500 hover:to-yellow-500
                    hover:text-white transition"
                  >
                    Log In
                  </Link>

                  <Link
                    href="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-semibold text-gray-700
                    hover:bg-gradient-to-r hover:from-green-500 hover:to-yellow-500
                    hover:text-white transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
