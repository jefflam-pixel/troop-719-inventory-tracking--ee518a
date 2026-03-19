"use client";
import "./globals.css";
import React, { useState, Component } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Error Boundary — catches render errors and shows a friendly inline message.
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-6">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/checkouts", label: "Checkouts" },
  { href: "/equipment-checkin", label: "Equipment checkin" },
  { href: "/inventory", label: "Inventory" },
  { href: "/chain-of-custody", label: "Chain of custody" },
  { href: "/reports", label: "Reports" },
  { href: "/access-control", label: "Access control" },
  { href: "/business-integration", label: "Business integration" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white shadow-lg rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-40 transform transition-transform duration-200 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-xl font-bold">Troop 719 Inventory Tracking </h1>
            <p className="text-sm text-slate-400 mt-1">Dev AI Platform</p>
          </div>
          <nav className="mt-4 px-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{link.href === "/" ? "🏠" : "📄"}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">Built with Dev AI</p>
          </div>
        </aside>

        {/* Main content — wrapped in ErrorBoundary so sidebar stays visible on errors */}
        <main className="lg:ml-64 min-h-screen">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </body>
    </html>
  );
}
