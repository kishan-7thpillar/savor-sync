export interface ProfitData {
  date: string;
  location: string;
  sales: number;
  labourCost: number;
  ingredientsCost: number;
  rentalCost: number;
  profit: number;
}

export interface LocationData {
  [key: string]: ProfitData[];
}

// Mock data for profit calculations
export const mockProfitData: LocationData = {
  all: [
    // Last 30 days of combined data
    {
      date: "2025-01-03",
      location: "all",
      sales: 8500,
      labourCost: 2800,
      ingredientsCost: 2400,
      rentalCost: 800,
      profit: 2500,
    },
    {
      date: "2025-01-04",
      location: "all",
      sales: 9200,
      labourCost: 3000,
      ingredientsCost: 2600,
      rentalCost: 800,
      profit: 2800,
    },
    {
      date: "2025-01-05",
      location: "all",
      sales: 7800,
      labourCost: 2600,
      ingredientsCost: 2200,
      rentalCost: 800,
      profit: 2200,
    },
    {
      date: "2025-01-06",
      location: "all",
      sales: 10500,
      labourCost: 3400,
      ingredientsCost: 3000,
      rentalCost: 800,
      profit: 3300,
    },
    {
      date: "2025-01-07",
      location: "all",
      sales: 11200,
      labourCost: 3600,
      ingredientsCost: 3200,
      rentalCost: 800,
      profit: 3600,
    },
    {
      date: "2025-01-08",
      location: "all",
      sales: 9800,
      labourCost: 3200,
      ingredientsCost: 2800,
      rentalCost: 800,
      profit: 3000,
    },
    {
      date: "2025-01-09",
      location: "all",
      sales: 8900,
      labourCost: 2900,
      ingredientsCost: 2500,
      rentalCost: 800,
      profit: 2700,
    },
    {
      date: "2025-01-10",
      location: "all",
      sales: 9600,
      labourCost: 3100,
      ingredientsCost: 2700,
      rentalCost: 800,
      profit: 3000,
    },
    {
      date: "2025-01-11",
      location: "all",
      sales: 8200,
      labourCost: 2700,
      ingredientsCost: 2300,
      rentalCost: 800,
      profit: 2400,
    },
    {
      date: "2025-01-12",
      location: "all",
      sales: 10800,
      labourCost: 3500,
      ingredientsCost: 3100,
      rentalCost: 800,
      profit: 3400,
    },
    {
      date: "2025-01-13",
      location: "all",
      sales: 12000,
      labourCost: 3800,
      ingredientsCost: 3400,
      rentalCost: 800,
      profit: 4000,
    },
    {
      date: "2025-01-14",
      location: "all",
      sales: 11500,
      labourCost: 3700,
      ingredientsCost: 3300,
      rentalCost: 800,
      profit: 3700,
    },
    {
      date: "2025-01-15",
      location: "all",
      sales: 9400,
      labourCost: 3000,
      ingredientsCost: 2600,
      rentalCost: 800,
      profit: 3000,
    },
    {
      date: "2025-01-16",
      location: "all",
      sales: 8700,
      labourCost: 2800,
      ingredientsCost: 2400,
      rentalCost: 800,
      profit: 2700,
    },
    {
      date: "2025-01-17",
      location: "all",
      sales: 10200,
      labourCost: 3300,
      ingredientsCost: 2900,
      rentalCost: 800,
      profit: 3200,
    },
    {
      date: "2025-01-18",
      location: "all",
      sales: 9900,
      labourCost: 3200,
      ingredientsCost: 2800,
      rentalCost: 800,
      profit: 3100,
    },
    {
      date: "2025-01-19",
      location: "all",
      sales: 11800,
      labourCost: 3800,
      ingredientsCost: 3400,
      rentalCost: 800,
      profit: 3800,
    },
    {
      date: "2025-01-20",
      location: "all",
      sales: 12500,
      labourCost: 4000,
      ingredientsCost: 3600,
      rentalCost: 800,
      profit: 4100,
    },
    {
      date: "2025-01-21",
      location: "all",
      sales: 10600,
      labourCost: 3400,
      ingredientsCost: 3000,
      rentalCost: 800,
      profit: 3400,
    },
    {
      date: "2025-01-22",
      location: "all",
      sales: 9300,
      labourCost: 3000,
      ingredientsCost: 2600,
      rentalCost: 800,
      profit: 2900,
    },
    {
      date: "2025-01-23",
      location: "all",
      sales: 8800,
      labourCost: 2800,
      ingredientsCost: 2500,
      rentalCost: 800,
      profit: 2700,
    },
    {
      date: "2025-01-24",
      location: "all",
      sales: 10100,
      labourCost: 3200,
      ingredientsCost: 2900,
      rentalCost: 800,
      profit: 3200,
    },
    {
      date: "2025-01-25",
      location: "all",
      sales: 11400,
      labourCost: 3600,
      ingredientsCost: 3200,
      rentalCost: 800,
      profit: 3800,
    },
    {
      date: "2025-01-26",
      location: "all",
      sales: 12200,
      labourCost: 3900,
      ingredientsCost: 3500,
      rentalCost: 800,
      profit: 4000,
    },
    {
      date: "2025-01-27",
      location: "all",
      sales: 10900,
      labourCost: 3500,
      ingredientsCost: 3100,
      rentalCost: 800,
      profit: 3500,
    },
    {
      date: "2025-01-28",
      location: "all",
      sales: 9700,
      labourCost: 3100,
      ingredientsCost: 2700,
      rentalCost: 800,
      profit: 3100,
    },
    {
      date: "2025-01-29",
      location: "all",
      sales: 8600,
      labourCost: 2700,
      ingredientsCost: 2400,
      rentalCost: 800,
      profit: 2700,
    },
    {
      date: "2025-01-30",
      location: "all",
      sales: 9800,
      labourCost: 3100,
      ingredientsCost: 2800,
      rentalCost: 800,
      profit: 3100,
    },
    {
      date: "2025-01-31",
      location: "all",
      sales: 11000,
      labourCost: 3500,
      ingredientsCost: 3100,
      rentalCost: 800,
      profit: 3600,
    },
    {
      date: "2025-02-01",
      location: "all",
      sales: 10400,
      labourCost: 3300,
      ingredientsCost: 2900,
      rentalCost: 800,
      profit: 3400,
    },
  ],
  "d260bb7d-752b-45f3-b3f8-1a51a6ac109b": [
    // Downtown location specific data
    {
      date: "2025-01-03",
      location: "downtown",
      sales: 5000,
      labourCost: 1600,
      ingredientsCost: 1400,
      rentalCost: 500,
      profit: 1500,
    },
    {
      date: "2025-01-04",
      location: "downtown",
      sales: 5500,
      labourCost: 1800,
      ingredientsCost: 1600,
      rentalCost: 500,
      profit: 1600,
    },
    {
      date: "2025-01-05",
      location: "downtown",
      sales: 4600,
      labourCost: 1500,
      ingredientsCost: 1300,
      rentalCost: 500,
      profit: 1300,
    },
    {
      date: "2025-01-06",
      location: "downtown",
      sales: 6200,
      labourCost: 2000,
      ingredientsCost: 1800,
      rentalCost: 500,
      profit: 1900,
    },
    {
      date: "2025-01-07",
      location: "downtown",
      sales: 6700,
      labourCost: 2200,
      ingredientsCost: 1900,
      rentalCost: 500,
      profit: 2100,
    },
    {
      date: "2025-01-08",
      location: "downtown",
      sales: 5800,
      labourCost: 1900,
      ingredientsCost: 1700,
      rentalCost: 500,
      profit: 1700,
    },
    {
      date: "2025-01-09",
      location: "downtown",
      sales: 5300,
      labourCost: 1700,
      ingredientsCost: 1500,
      rentalCost: 500,
      profit: 1600,
    },
    {
      date: "2025-01-10",
      location: "downtown",
      sales: 5700,
      labourCost: 1800,
      ingredientsCost: 1600,
      rentalCost: 500,
      profit: 1800,
    },
    {
      date: "2025-01-11",
      location: "downtown",
      sales: 4900,
      labourCost: 1600,
      ingredientsCost: 1400,
      rentalCost: 500,
      profit: 1400,
    },
    {
      date: "2025-01-12",
      location: "downtown",
      sales: 6400,
      labourCost: 2100,
      ingredientsCost: 1800,
      rentalCost: 500,
      profit: 2000,
    },
    {
      date: "2025-01-13",
      location: "downtown",
      sales: 7200,
      labourCost: 2300,
      ingredientsCost: 2000,
      rentalCost: 500,
      profit: 2400,
    },
    {
      date: "2025-01-14",
      location: "downtown",
      sales: 6800,
      labourCost: 2200,
      ingredientsCost: 1900,
      rentalCost: 500,
      profit: 2200,
    },
    {
      date: "2025-01-15",
      location: "downtown",
      sales: 5600,
      labourCost: 1800,
      ingredientsCost: 1600,
      rentalCost: 500,
      profit: 1700,
    },
    {
      date: "2025-01-16",
      location: "downtown",
      sales: 5200,
      labourCost: 1700,
      ingredientsCost: 1500,
      rentalCost: 500,
      profit: 1500,
    },
    {
      date: "2025-01-17",
      location: "downtown",
      sales: 6100,
      labourCost: 2000,
      ingredientsCost: 1700,
      rentalCost: 500,
      profit: 1900,
    },
    {
      date: "2025-01-18",
      location: "downtown",
      sales: 5900,
      labourCost: 1900,
      ingredientsCost: 1700,
      rentalCost: 500,
      profit: 1800,
    },
    {
      date: "2025-01-19",
      location: "downtown",
      sales: 7000,
      labourCost: 2300,
      ingredientsCost: 2000,
      rentalCost: 500,
      profit: 2200,
    },
    {
      date: "2025-01-20",
      location: "downtown",
      sales: 7500,
      labourCost: 2400,
      ingredientsCost: 2100,
      rentalCost: 500,
      profit: 2500,
    },
    {
      date: "2025-01-21",
      location: "downtown",
      sales: 6300,
      labourCost: 2000,
      ingredientsCost: 1800,
      rentalCost: 500,
      profit: 2000,
    },
    {
      date: "2025-01-22",
      location: "downtown",
      sales: 5500,
      labourCost: 1800,
      ingredientsCost: 1600,
      rentalCost: 500,
      profit: 1600,
    },
    {
      date: "2025-01-23",
      location: "downtown",
      sales: 5200,
      labourCost: 1700,
      ingredientsCost: 1500,
      rentalCost: 500,
      profit: 1500,
    },
    {
      date: "2025-01-24",
      location: "downtown",
      sales: 6000,
      labourCost: 1900,
      ingredientsCost: 1700,
      rentalCost: 500,
      profit: 1900,
    },
    {
      date: "2025-01-25",
      location: "downtown",
      sales: 6800,
      labourCost: 2200,
      ingredientsCost: 1900,
      rentalCost: 500,
      profit: 2200,
    },
    {
      date: "2025-01-26",
      location: "downtown",
      sales: 7300,
      labourCost: 2300,
      ingredientsCost: 2100,
      rentalCost: 500,
      profit: 2400,
    },
    {
      date: "2025-01-27",
      location: "downtown",
      sales: 6500,
      labourCost: 2100,
      ingredientsCost: 1800,
      rentalCost: 500,
      profit: 2100,
    },
    {
      date: "2025-01-28",
      location: "downtown",
      sales: 5800,
      labourCost: 1900,
      ingredientsCost: 1600,
      rentalCost: 500,
      profit: 1800,
    },
    {
      date: "2025-01-29",
      location: "downtown",
      sales: 5100,
      labourCost: 1600,
      ingredientsCost: 1400,
      rentalCost: 500,
      profit: 1600,
    },
    {
      date: "2025-01-30",
      location: "downtown",
      sales: 5800,
      labourCost: 1900,
      ingredientsCost: 1700,
      rentalCost: 500,
      profit: 1700,
    },
    {
      date: "2025-01-31",
      location: "downtown",
      sales: 6600,
      labourCost: 2100,
      ingredientsCost: 1900,
      rentalCost: 500,
      profit: 2100,
    },
    {
      date: "2025-02-01",
      location: "downtown",
      sales: 6200,
      labourCost: 2000,
      ingredientsCost: 1700,
      rentalCost: 500,
      profit: 2000,
    },
  ],
  "d3d142b2-87d8-4b4c-bdd9-9627d0a05cdc": [
    // Uptown location specific data
    {
      date: "2025-01-03",
      location: "uptown",
      sales: 3500,
      labourCost: 1200,
      ingredientsCost: 1000,
      rentalCost: 300,
      profit: 1000,
    },
    {
      date: "2025-01-04",
      location: "uptown",
      sales: 3700,
      labourCost: 1200,
      ingredientsCost: 1000,
      rentalCost: 300,
      profit: 1200,
    },
    {
      date: "2025-01-05",
      location: "uptown",
      sales: 3200,
      labourCost: 1100,
      ingredientsCost: 900,
      rentalCost: 300,
      profit: 900,
    },
    {
      date: "2025-01-06",
      location: "uptown",
      sales: 4300,
      labourCost: 1400,
      ingredientsCost: 1200,
      rentalCost: 300,
      profit: 1400,
    },
    {
      date: "2025-01-07",
      location: "uptown",
      sales: 4500,
      labourCost: 1400,
      ingredientsCost: 1300,
      rentalCost: 300,
      profit: 1500,
    },
    {
      date: "2025-01-08",
      location: "uptown",
      sales: 4000,
      labourCost: 1300,
      ingredientsCost: 1100,
      rentalCost: 300,
      profit: 1300,
    },
    {
      date: "2025-01-09",
      location: "uptown",
      sales: 3600,
      labourCost: 1200,
      ingredientsCost: 1000,
      rentalCost: 300,
      profit: 1100,
    },
    {
      date: "2025-01-10",
      location: "uptown",
      sales: 3900,
      labourCost: 1300,
      ingredientsCost: 1100,
      rentalCost: 300,
      profit: 1200,
    },
    {
      date: "2025-01-11",
      location: "uptown",
      sales: 3300,
      labourCost: 1100,
      ingredientsCost: 900,
      rentalCost: 300,
      profit: 1000,
    },
    {
      date: "2025-01-12",
      location: "uptown",
      sales: 4400,
      labourCost: 1400,
      ingredientsCost: 1300,
      rentalCost: 300,
      profit: 1400,
    },
    {
      date: "2025-01-13",
      location: "uptown",
      sales: 4800,
      labourCost: 1500,
      ingredientsCost: 1400,
      rentalCost: 300,
      profit: 1600,
    },
    {
      date: "2025-01-14",
      location: "uptown",
      sales: 4700,
      labourCost: 1500,
      ingredientsCost: 1400,
      rentalCost: 300,
      profit: 1500,
    },
    {
      date: "2025-01-15",
      location: "uptown",
      sales: 3800,
      labourCost: 1200,
      ingredientsCost: 1000,
      rentalCost: 300,
      profit: 1300,
    },
    {
      date: "2025-01-16",
      location: "uptown",
      sales: 3500,
      labourCost: 1100,
      ingredientsCost: 900,
      rentalCost: 300,
      profit: 1200,
    },
    {
      date: "2025-01-17",
      location: "uptown",
      sales: 4100,
      labourCost: 1300,
      ingredientsCost: 1200,
      rentalCost: 300,
      profit: 1300,
    },
    {
      date: "2025-01-18",
      location: "uptown",
      sales: 4000,
      labourCost: 1300,
      ingredientsCost: 1100,
      rentalCost: 300,
      profit: 1300,
    },
    {
      date: "2025-01-19",
      location: "uptown",
      sales: 4800,
      labourCost: 1500,
      ingredientsCost: 1400,
      rentalCost: 300,
      profit: 1600,
    },
    {
      date: "2025-01-20",
      location: "uptown",
      sales: 5000,
      labourCost: 1600,
      ingredientsCost: 1500,
      rentalCost: 300,
      profit: 1600,
    },
    {
      date: "2025-01-21",
      location: "uptown",
      sales: 4300,
      labourCost: 1400,
      ingredientsCost: 1200,
      rentalCost: 300,
      profit: 1400,
    },
    {
      date: "2025-01-22",
      location: "uptown",
      sales: 3800,
      labourCost: 1200,
      ingredientsCost: 1000,
      rentalCost: 300,
      profit: 1300,
    },
    {
      date: "2025-01-23",
      location: "uptown",
      sales: 3600,
      labourCost: 1100,
      ingredientsCost: 1000,
      rentalCost: 300,
      profit: 1200,
    },
    {
      date: "2025-01-24",
      location: "uptown",
      sales: 4100,
      labourCost: 1300,
      ingredientsCost: 1200,
      rentalCost: 300,
      profit: 1300,
    },
    {
      date: "2025-01-25",
      location: "uptown",
      sales: 4600,
      labourCost: 1400,
      ingredientsCost: 1300,
      rentalCost: 300,
      profit: 1600,
    },
    {
      date: "2025-01-26",
      location: "uptown",
      sales: 4900,
      labourCost: 1600,
      ingredientsCost: 1400,
      rentalCost: 300,
      profit: 1600,
    },
    {
      date: "2025-01-27",
      location: "uptown",
      sales: 4400,
      labourCost: 1400,
      ingredientsCost: 1300,
      rentalCost: 300,
      profit: 1400,
    },
    {
      date: "2025-01-28",
      location: "uptown",
      sales: 3900,
      labourCost: 1200,
      ingredientsCost: 1100,
      rentalCost: 300,
      profit: 1300,
    },
    {
      date: "2025-01-29",
      location: "uptown",
      sales: 3500,
      labourCost: 1100,
      ingredientsCost: 1000,
      rentalCost: 300,
      profit: 1100,
    },
    {
      date: "2025-01-30",
      location: "uptown",
      sales: 4000,
      labourCost: 1200,
      ingredientsCost: 1100,
      rentalCost: 300,
      profit: 1400,
    },
    {
      date: "2025-01-31",
      location: "uptown",
      sales: 4400,
      labourCost: 1400,
      ingredientsCost: 1200,
      rentalCost: 300,
      profit: 1500,
    },
    {
      date: "2025-02-01",
      location: "uptown",
      sales: 4200,
      labourCost: 1300,
      ingredientsCost: 1200,
      rentalCost: 300,
      profit: 1400,
    },
  ],
};

// Helper functions for data filtering and aggregation
export const getDataByLocation = (location: string): ProfitData[] => {
  return mockProfitData[location] || [];
};

export const getDataByDateRange = (
  location: string,
  days: number
): ProfitData[] => {
  const data = getDataByLocation(location);
  return data.slice(-days);
};

// Get specific day data
export const getSpecificDayData = (
  location: string,
  date: string
): ProfitData | null => {
  const data = getDataByLocation(location);
  return data.find((item) => item.date === date) || null;
};

// Get specific week data (aggregated)
export const getSpecificWeekData = (
  location: string,
  weekStartDate: string
): ProfitData => {
  const data = getDataByLocation(location);
  const weekStart = new Date(weekStartDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekData = data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= weekStart && itemDate <= weekEnd;
  });

  return weekData.reduce(
    (acc, item) => ({
      date: weekStartDate,
      location: item.location,
      sales: acc.sales + item.sales,
      labourCost: acc.labourCost + item.labourCost,
      ingredientsCost: acc.ingredientsCost + item.ingredientsCost,
      rentalCost: acc.rentalCost + item.rentalCost,
      profit: acc.profit + item.profit,
    }),
    {
      date: weekStartDate,
      location,
      sales: 0,
      labourCost: 0,
      ingredientsCost: 0,
      rentalCost: 0,
      profit: 0,
    }
  );
};

// Get specific month data (aggregated)
export const getSpecificMonthData = (
  location: string,
  monthKey: string
): ProfitData => {
  const data = getDataByLocation(location);
  const [year, month] = monthKey.split("-");

  const monthData = data.filter((item) => {
    const itemDate = new Date(item.date);
    return (
      itemDate.getFullYear() === parseInt(year) &&
      itemDate.getMonth() + 1 === parseInt(month)
    );
  });

  return monthData.reduce(
    (acc, item) => ({
      date: monthKey,
      location: item.location,
      sales: acc.sales + item.sales,
      labourCost: acc.labourCost + item.labourCost,
      ingredientsCost: acc.ingredientsCost + item.ingredientsCost,
      rentalCost: acc.rentalCost + item.rentalCost,
      profit: acc.profit + item.profit,
    }),
    {
      date: monthKey,
      location,
      sales: 0,
      labourCost: 0,
      ingredientsCost: 0,
      rentalCost: 0,
      profit: 0,
    }
  );
};

// Calculate daily rental cost (monthly rental / 30)
export const calculateDailyRentalCost = (monthlyRental: number): number => {
  return monthlyRental / 30;
};

// Get available dates for location
export const getAvailableDates = (location: string): string[] => {
  const data = getDataByLocation(location);
  return data.map((item) => item.date).sort();
};

// Get available weeks for location
export const getAvailableWeeks = (location: string): string[] => {
  const data = getDataByLocation(location);
  const weeks = new Set<string>();

  data.forEach((item) => {
    const date = new Date(item.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weeks.add(weekStart.toISOString().split("T")[0]);
  });

  return Array.from(weeks).sort();
};

// Get available months for location
export const getAvailableMonths = (location: string): string[] => {
  const data = getDataByLocation(location);
  const months = new Set<string>();

  data.forEach((item) => {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    months.add(monthKey);
  });

  return Array.from(months).sort();
};

export const aggregateDataByPeriod = (
  data: ProfitData[],
  period: "day" | "week" | "month"
) => {
  if (period === "day") return data;

  const aggregated: { [key: string]: ProfitData } = {};

  data.forEach((item) => {
    const date = new Date(item.date);
    let key: string;

    if (period === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split("T")[0];
    } else {
      // month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    }

    if (!aggregated[key]) {
      aggregated[key] = {
        date: key,
        location: item.location,
        sales: 0,
        labourCost: 0,
        ingredientsCost: 0,
        rentalCost: 0,
        profit: 0,
      };
    }

    aggregated[key].sales += item.sales;
    aggregated[key].labourCost += item.labourCost;
    aggregated[key].ingredientsCost += item.ingredientsCost;
    aggregated[key].rentalCost += item.rentalCost;
    aggregated[key].profit += item.profit;
  });

  return Object.values(aggregated).sort((a, b) => a.date.localeCompare(b.date));
};
