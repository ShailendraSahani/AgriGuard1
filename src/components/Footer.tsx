'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sprout,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Send,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/agriguard', label: 'Twitter' },
    { icon: Facebook, href: 'https://facebook.com/agriguard', label: 'Facebook' },
    { icon: Linkedin, href: 'https://linkedin.com/company/agriguard', label: 'LinkedIn' },
  ];

  const quickLinks = [
    { href: '/services', label: 'Services' },
    { href: '/lands', label: 'Lands' },
    { href: '/packages', label: 'Packages' },
    { href: '/auth/signin', label: 'Sign In' },
  ];

  const contactInfo = [
    { icon: Mail, text: 'agriguard.services@gmail.com', href: 'mailto:agriguard.services@gmail.com' },
    { icon: Phone, text: '+91 7388711487', href: 'tel:+917388711487' },
    { icon: MapPin, text: 'Sahjanwa, Gorakhpur,UP-273209', href: 'https://maps.google.com/?q=123+Farm+Road,+AgriCity' },
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubscribed) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-r from-green-500 to-yellow-500 text-white">
      {/* 🌟 Floating Gradient Blobs */}
      <motion.div
        className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-green-500/30 rounded-full blur-[120px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-yellow-500/20 rounded-full blur-[140px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      {/* 🌿 Footer Content */}
      <div className="relative w-full px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-14">
          {/* ✅ Brand Info */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-yellow-500 flex items-center justify-center shadow-xl">
                <Sprout className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-500 to-yellow-500 bg-clip-text text-transparent">
                AgriGuard
              </h2>
            </div>

            <p className="text-green-100/80 text-lg leading-relaxed mb-8 max-w-lg">
              Empowering farmers with modern technology. Lease land, book
              services, and access complete farming solutions online.
            </p>

            {/* 🌟 Newsletter */}
            <form onSubmit={handleNewsletterSubmit} className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-3 max-w-md shadow-lg">
              <Mail className="text-yellow-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Subscribe for updates..."
                className="bg-transparent flex-1 outline-none text-sm text-white placeholder:text-white/50"
                disabled={isSubscribed || isLoading}
              />
              <button
                type="submit"
                disabled={!email || isSubscribed || isLoading}
                className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-yellow-500 hover:opacity-90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribed ? <Check className="w-4 h-4 text-white" /> : <Send className="w-4 h-4 text-white" />}
              </button>
            </form>

            {/* Social Icons */}
            <div className="flex gap-4 mt-8">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.15, y: -4 }}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-gradient-to-r hover:from-green-500 hover:to-yellow-500 transition shadow-lg"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* ✅ Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-xl font-bold mb-6 text-yellow-500">
              Quick Links
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-green-100/80 hover:text-yellow-500 transition-all hover:translate-x-2 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ✅ Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h4 className="text-xl font-bold mb-6 text-yellow-500">
              Contact Us
            </h4>

            <ul className="space-y-5">
              {contactInfo.map((item, index) => (
                <motion.li
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 text-green-100/80"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-md">
                    <item.icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <a
                    href={item.href}
                    className="hover:text-yellow-300 transition"
                    target={item.icon === MapPin ? "_blank" : undefined}
                    rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                  >
                    {item.text}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ✅ Bottom Bar */}
        <div className="border-t border-white/10 mt-14 pt-8 text-center">
          <p className="text-green-100/70 text-sm">
            © 2024 AgriGuard Marketplace — All rights reserved.
          </p>

          <div className="flex justify-center gap-6 mt-4 text-sm text-green-200/70">
            <Link href="/privacy-policy" className="hover:text-yellow-400 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-yellow-400 transition">
              Terms
            </Link>
            <Link href="/support" className="hover:text-yellow-400 transition">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
