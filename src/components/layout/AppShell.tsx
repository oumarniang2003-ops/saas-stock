"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Warehouse,
  Truck,
  Menu,
  X,
  Plus,
  Boxes,
  Building2,
  AlertTriangle,
  Users,
  FileText,
} from "lucide-react";
import QuickMovementModal from "../movements/QuickMovementModal";

interface AppShellProps {
  children: React.ReactNode;
  organizationName?: string;
  userRole?: string;
}

const navItems = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Produits & Stock", href: "/products", icon: Package },
  { name: "Mouvements", href: "/movements", icon: ArrowLeftRight },
  { name: "Devis", href: "/quotes", icon: FileText },
  { name: "Entrepôts", href: "/warehouses", icon: Warehouse },
  { name: "Fournisseurs", href: "/suppliers", icon: Truck },
  { name: "Équipe", href: "/team", icon: Users },
];

export default function AppShell({
  children,
  organizationName = "Mon Organisation",
  userRole = "OWNER",
}: AppShellProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickMovementOpen, setQuickMovementOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo & Organization */}
        <div className="p-5 border-b border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shadow-lg shadow-indigo-500/10">
                <Boxes className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight block">
                  StockMaster
                </span>
                <span className="text-[11px] font-medium tracking-wide uppercase text-indigo-400">
                  SaaS Quincaillerie
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Tenant Badge */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {organizationName}
              </p>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                {userRole === "OWNER"
                  ? "Propriétaire"
                  : userRole === "ADMIN"
                  ? "Administrateur"
                  : "Employé"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="p-4">
          <button
            onClick={() => setQuickMovementOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Mouvement</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-indigo-400" : "text-slate-400"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 border border-slate-700",
                },
              }}
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress || "Utilisateur"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Multi-tenant Actif
              </span>
              <span>•</span>
              <span className="text-slate-300">{organizationName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuickMovementOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-medium transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Entrée / Sortie</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Quick Movement Modal */}
      {quickMovementOpen && (
        <QuickMovementModal onClose={() => setQuickMovementOpen(false)} />
      )}
    </div>
  );
}
