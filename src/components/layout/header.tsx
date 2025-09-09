"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationCenter } from "@/components/dashboard/notification-center";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogOut, Settings, User } from "lucide-react";
import type { Profile } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedLocation, setLocations } from "@/store/locationSlice";
import { mockLocations } from "@/data/mockSalesData";

// Use the location type from mockSalesData
interface Location {
  id: string;
  name: string;
  isActive: boolean;
}

interface HeaderProps {
  user: any;
  profile: Profile | null;
}

export function Header({ user, profile }: HeaderProps) {
  const [locations, setLocationsList] = useState<Location[]>([]);
  const dispatch = useAppDispatch();
  const selectedLocation = useAppSelector(
    (state) => state.location.selectedLocation
  );
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Use mock locations instead of fetching from Supabase
    fetchLocations();
  }, []);

  const fetchLocations = () => {
    // Map mock locations to match our Location interface
    const formattedLocations = mockLocations.map((location) => ({
      id: location.id,
      name: location.name,
      isActive: location.isActive,
    }));

    setLocationsList(formattedLocations);
    dispatch(setLocations(formattedLocations));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Location:</span>
          <Select
            value={selectedLocation}
            onValueChange={(value) => dispatch(setSelectedLocation(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  <div className="flex items-center space-x-2">
                    <span>{location.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {location.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <NotificationCenter />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {profile?.full_name ? getInitials(profile.full_name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <Badge variant="outline" className="w-fit text-xs">
                  {profile?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
