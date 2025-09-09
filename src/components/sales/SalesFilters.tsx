'use client';

import { useState } from 'react';
import { CalendarIcon, MapPinIcon, FilterIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { DateRange, getDateRangePresets } from '@/lib/salesAnalytics';
import { mockLocations, Order } from '@/data/mockSalesData';

export interface SalesFilters {
  dateRange: DateRange;
  locationIds: string[];
  channels: Order['channel'][];
  customDateRange?: {
    from: Date;
    to: Date;
  };
}

interface SalesFiltersProps {
  filters: SalesFilters;
  onFiltersChange: (filters: SalesFilters) => void;
  onApplyFilters: () => void;
  totalOrders: number;
  filteredOrders: number;
}

export function SalesFiltersPanel({ 
  filters, 
  onFiltersChange, 
  onApplyFilters,
  totalOrders,
  filteredOrders 
}: SalesFiltersProps) {
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>(
    filters.customDateRange
  );

  const datePresets = getDateRangePresets();
  const channels: Order['channel'][] = ['dine-in', 'takeout', 'delivery', 'catering'];

  const handleDateRangeChange = (presetKey: string) => {
    if (presetKey === 'custom') {
      setIsCustomDateOpen(true);
      return;
    }

    const preset = datePresets[presetKey];
    if (preset) {
      onFiltersChange({
        ...filters,
        dateRange: preset,
        customDateRange: undefined
      });
    }
  };

  const handleCustomDateChange = (range: { from: Date; to: Date } | undefined) => {
    setCustomRange(range);
    if (range?.from && range?.to) {
      onFiltersChange({
        ...filters,
        dateRange: {
          startDate: range.from,
          endDate: range.to,
          label: 'Custom Range'
        },
        customDateRange: range
      });
    }
  };

  const handleLocationChange = (locationId: string, checked: boolean) => {
    const newLocationIds = checked
      ? [...filters.locationIds, locationId]
      : filters.locationIds.filter(id => id !== locationId);

    onFiltersChange({
      ...filters,
      locationIds: newLocationIds
    });
  };

  const handleChannelChange = (channel: Order['channel'], checked: boolean) => {
    const newChannels = checked
      ? [...filters.channels, channel]
      : filters.channels.filter(c => c !== channel);

    onFiltersChange({
      ...filters,
      channels: newChannels
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: datePresets.last7Days,
      locationIds: [],
      channels: [],
      customDateRange: undefined
    });
    setCustomRange(undefined);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.locationIds.length > 0) count++;
    if (filters.channels.length > 0) count++;
    return count;
  };

  const getCurrentDateRangeKey = () => {
    if (filters.customDateRange) return 'custom';
    return Object.keys(datePresets).find(key => 
      datePresets[key].label === filters.dateRange.label
    ) || 'last7Days';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Showing {filteredOrders.toLocaleString()} of {totalOrders.toLocaleString()} orders
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} active
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              disabled={getActiveFiltersCount() === 0}
            >
              <XIcon className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button size="sm" onClick={onApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Date Range</span>
          </div>
          <Select value={getCurrentDateRangeKey()} onValueChange={handleDateRangeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(datePresets).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  {preset.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {/* Custom Date Range Picker */}
          <Popover open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !customRange ? 'text-muted-foreground' : ''
                }`}
                style={{ display: getCurrentDateRangeKey() === 'custom' ? 'flex' : 'none' }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customRange?.from ? (
                  customRange.to ? (
                    <>
                      {customRange.from.toLocaleDateString()} -{' '}
                      {customRange.to.toLocaleDateString()}
                    </>
                  ) : (
                    customRange.from.toLocaleDateString()
                  )
                ) : (
                  'Pick a date range'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={customRange?.from}
                selected={customRange}
                onSelect={handleCustomDateChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Location Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Locations</span>
            {filters.locationIds.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {filters.locationIds.length} selected
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            {mockLocations.map((location) => (
              <div key={location.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-${location.id}`}
                  checked={filters.locationIds.includes(location.id)}
                  onCheckedChange={(checked) =>
                    handleLocationChange(location.id, checked as boolean)
                  }
                />
                <label
                  htmlFor={`location-${location.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {location.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">Order Channels</span>
            {filters.channels.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {filters.channels.length} selected
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            {channels.map((channel) => (
              <div key={channel} className="flex items-center space-x-2">
                <Checkbox
                  id={`channel-${channel}`}
                  checked={filters.channels.includes(channel)}
                  onCheckedChange={(checked) =>
                    handleChannelChange(channel, checked as boolean)
                  }
                />
                <label
                  htmlFor={`channel-${channel}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                >
                  {channel}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {(filters.locationIds.length > 0 || filters.channels.length > 0) && (
          <div className="space-y-3 pt-4 border-t">
            <span className="font-medium text-sm">Active Filters:</span>
            <div className="flex flex-wrap gap-2">
              {filters.locationIds.map((locationId) => {
                const location = mockLocations.find(l => l.id === locationId);
                return (
                  <Badge key={locationId} variant="outline" className="text-xs">
                    📍 {location?.name}
                  </Badge>
                );
              })}
              {filters.channels.map((channel) => (
                <Badge key={channel} variant="outline" className="text-xs capitalize">
                  🛒 {channel}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface QuickFiltersProps {
  onQuickFilter: (filterType: 'today' | 'yesterday' | 'thisWeek' | 'thisMonth') => void;
  currentFilter: string;
}

export function QuickFilters({ onQuickFilter, currentFilter }: QuickFiltersProps) {
  const quickFilters = [
    { key: 'today', label: 'Today', icon: '📅' },
    { key: 'yesterday', label: 'Yesterday', icon: '📆' },
    { key: 'thisWeek', label: 'This Week', icon: '🗓️' },
    { key: 'thisMonth', label: 'This Month', icon: '📊' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground">Quick filters:</span>
      {quickFilters.map((filter) => (
        <Button
          key={filter.key}
          variant={currentFilter === filter.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onQuickFilter(filter.key as any)}
          className="text-xs"
        >
          <span className="mr-1">{filter.icon}</span>
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
