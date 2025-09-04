"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

export function MetricsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  loading = false,
  onClick,
}: MetricsCardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0)
      return <Minus className="h-3 w-3" />;
    return change > 0 ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    );
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return "text-muted-foreground";
    return change > 0 ? "text-green-600" : "text-red-600";
  };

  const getBadgeVariant = () => {
    if (change === undefined || change === 0) return "secondary";
    return change > 0 ? "default" : "destructive";
  };

  if (loading) {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-colors hover:bg-accent",
          onClick && "cursor-pointer"
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "transition-colors hover:bg-accent",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1 text-xs">
            <Badge
              variant={getBadgeVariant()}
              className="flex items-center space-x-1"
            >
              {getTrendIcon()}
              <span>{Math.floor(Math.abs(change))}%</span>
            </Badge>
            {changeLabel && (
              <span className="text-muted-foreground">{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
