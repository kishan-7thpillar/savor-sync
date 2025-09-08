"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Clock,
  DollarSign,
  Package,
  Users,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { ProfitData } from "@/data/mockProfitData";

interface SmartInsightsProps {
  profitData: ProfitData[];
  currentMetrics: {
    totalProfit: number;
    totalSales: number;
    totalLabourCost: number;
    totalIngredientsCost: number;
    totalRentalCost: number;
  };
  selectedLocation: string;
  timeFilter: "day" | "week" | "month";
}

interface Insight {
  id: string;
  type:
    | "cost_optimization"
    | "efficiency"
    | "revenue"
    | "alert"
    | "opportunity";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  actionable: string;
  category: "labour" | "ingredients" | "rental" | "operations" | "general";
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  potentialSavings?: number;
  confidence: number;
}

export function SmartInsights({
  profitData,
  currentMetrics,
  selectedLocation,
  timeFilter,
}: SmartInsightsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getLocationDisplayName = (location: string) => {
    switch (location) {
      case "all":
        return "All Locations";
      case "d260bb7d-752b-45f3-b3f8-1a51a6ac109b":
        return "Downtown";
      case "d3d142b2-87d8-4b4c-bdd9-9627d0a05cdc":
        return "Uptown";
      default:
        return location;
    }
  };

  // Generate insights based on the current data
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    if (profitData.length === 0) return insights;

    const profitMargin =
      currentMetrics.totalSales > 0
        ? (currentMetrics.totalProfit / currentMetrics.totalSales) * 100
        : 0;

    const labourPercentage =
      currentMetrics.totalSales > 0
        ? (currentMetrics.totalLabourCost / currentMetrics.totalSales) * 100
        : 0;

    const ingredientsPercentage =
      currentMetrics.totalSales > 0
        ? (currentMetrics.totalIngredientsCost / currentMetrics.totalSales) *
          100
        : 0;

    const rentalPercentage =
      currentMetrics.totalSales > 0
        ? (currentMetrics.totalRentalCost / currentMetrics.totalSales) * 100
        : 0;

    // Calculate daily averages from actual data
    const avgDailySales = currentMetrics.totalSales / profitData.length;
    const avgDailyProfit = currentMetrics.totalProfit / profitData.length;
    const avgDailyLabour = currentMetrics.totalLabourCost / profitData.length;
    const avgDailyIngredients =
      currentMetrics.totalIngredientsCost / profitData.length;

    // Find best and worst performing days
    const bestDay = profitData.reduce((max, day) =>
      day.profit > max.profit ? day : max
    );
    const worstDay = profitData.reduce((min, day) =>
      day.profit < min.profit ? day : min
    );

    // Calculate performance variance
    const profitVariance =
      ((bestDay.profit - worstDay.profit) / avgDailyProfit) * 100;

    // Insight 1: Labour cost efficiency analysis
    if (labourPercentage > 32) {
      const excessCost =
        ((labourPercentage - 30) * currentMetrics.totalSales) / 100;
      insights.push({
        id: "labour-efficiency",
        type: "cost_optimization",
        priority: "high",
        title: "Labour Cost Ratio Above Optimal Range",
        description: `Labour costs represent ${labourPercentage.toFixed(
          1
        )}% of total sales (${formatCurrency(
          currentMetrics.totalLabourCost
        )}), exceeding the optimal 30% benchmark by ${(
          labourPercentage - 30
        ).toFixed(1)} percentage points.`,
        impact: `Excess labour cost of ${formatCurrency(
          excessCost
        )} reducing profit margins`,
        actionable:
          "Review staffing schedules during low-sales periods and consider cross-training to improve efficiency.",
        category: "labour",
        icon: <Users className="h-5 w-5" />,
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        potentialSavings: excessCost * 0.6,
        confidence: 89,
      });
    }

    // Insight 2: Sales performance volatility
    if (profitVariance > 50) {
      insights.push({
        id: "sales-volatility",
        type: "efficiency",
        priority: "medium",
        title: "High Daily Performance Variance Detected",
        description: `Daily profit varies significantly: best day ${formatCurrency(
          bestDay.profit
        )} vs worst day ${formatCurrency(
          worstDay.profit
        )} (${profitVariance.toFixed(0)}% variance).`,
        impact: "Inconsistent operations leading to unpredictable cash flow",
        actionable:
          "Analyze factors contributing to high-performing days and standardize successful practices across all operations.",
        category: "operations",
        icon: <TrendingUp className="h-5 w-5" />,
        color: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200",
        potentialSavings:
          (bestDay.profit - avgDailyProfit) * profitData.length * 0.3,
        confidence: 82,
      });
    }

    // Insight 3: Ingredient cost optimization based on actual ratios
    if (ingredientsPercentage > 28) {
      const excessIngredientCost =
        ((ingredientsPercentage - 25) * currentMetrics.totalSales) / 100;
      insights.push({
        id: "ingredient-optimization",
        type: "cost_optimization",
        priority: "medium",
        title: "Ingredient Cost Ratio Above Target",
        description: `Ingredient costs account for ${ingredientsPercentage.toFixed(
          1
        )}% of sales (${formatCurrency(
          currentMetrics.totalIngredientsCost
        )}), above the target 25% for food service operations.`,
        impact: `Potential over-spending of ${formatCurrency(
          excessIngredientCost
        )} on ingredients`,
        actionable:
          "Review portion sizes, negotiate better supplier rates, or adjust menu pricing to improve ingredient cost ratios.",
        category: "ingredients",
        icon: <Package className="h-5 w-5" />,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 border-yellow-200",
        potentialSavings: excessIngredientCost * 0.4,
        confidence: 76,
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const insights = generateInsights();

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-700"
          >
            Medium Priority
          </Badge>
        );
      case "low":
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cost_optimization":
        return <DollarSign className="h-4 w-4" />;
      case "efficiency":
        return <TrendingUp className="h-4 w-4" />;
      case "revenue":
        return <Target className="h-4 w-4" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
      case "opportunity":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const totalPotentialSavings = insights.reduce(
    (sum, insight) => sum + (insight.potentialSavings || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header with summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Smart Insights</h2>
            <p className="text-muted-foreground">
              AI-powered cost optimization recommendations for{" "}
              {getLocationDisplayName(selectedLocation)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            Potential Monthly Savings
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalPotentialSavings)}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-red-700">
                  {insights.filter((i) => i.priority === "high").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">
                  Medium Priority
                </p>
                <p className="text-2xl font-bold text-yellow-700">
                  {insights.filter((i) => i.priority === "medium").length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Opportunities
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {insights.filter((i) => i.type === "opportunity").length}
                </p>
              </div>
              <Lightbulb className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Avg Confidence
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {Math.round(
                    insights.reduce((sum, i) => sum + i.confidence, 0) /
                      insights.length
                  )}
                  %
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <Card key={insight.id} className={`border-2 ${insight.bgColor}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                    {insight.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      {getPriorityBadge(insight.priority)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(insight.type)}
                        <span className="capitalize">
                          {insight.type.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{insight.confidence}% confidence</span>
                      </div>
                      {insight.potentialSavings && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium text-green-600">
                            {formatCurrency(insight.potentialSavings)} potential
                            savings
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-gray-700">{insight.description}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white/60 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-600 mb-1">
                      Impact
                    </h4>
                    <p className="text-sm">{insight.impact}</p>
                  </div>
                  <div className="p-3 bg-white/60 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-600 mb-1">
                      Recommended Action
                    </h4>
                    <p className="text-sm">{insight.actionable}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {insights.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
            <p className="text-muted-foreground">
              Insufficient data to generate meaningful insights. Please ensure
              you have sufficient historical data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
