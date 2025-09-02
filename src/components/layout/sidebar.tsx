"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  MapPin,
  TrendingUp,
  Settings,
  DollarSign,
  Trash2,
  Users,
  Package,
  Menu,
  BarChart3,
  Clock,
  FileText,
  Upload,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Locations", href: "/dashboard/locations", icon: MapPin },
  { name: "Sales", href: "/dashboard/sales", icon: TrendingUp },
  { name: "Operations", href: "/dashboard/operations", icon: Clock },
  { name: "Staff", href: "/dashboard/staff", icon: Users },
  { name: "Costs", href: "/dashboard/costs", icon: DollarSign },
  { name: "Wastage", href: "/dashboard/wastage", icon: Trash2 },
  { name: "Customer", href: "/dashboard/customers", icon: Users },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "API Docs", href: "/api/docs", icon: FileText },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6" />
          <span className="text-xl font-bold">SavorSync</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex md:w-64 md:flex-col", className)}>
        <div className="flex min-h-0 flex-1 flex-col border-r bg-card">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
