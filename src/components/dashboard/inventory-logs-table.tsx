'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Clock, Filter, Loader2, Package, RefreshCw, User } from 'lucide-react'
import { format } from 'date-fns'

interface InventoryLog {
  id: string
  order_id: string | null
  location_id: string
  updates: Array<{
    ingredient_id: string
    ingredient_name: string
    previousStock?: number
    newStock?: number
    quantity: number
    unit: string
  }>
  type: 'AUTO' | 'MANUAL'
  reason: string | null
  created_at: string
  profiles?: {
    full_name: string
  }
}

interface InventoryLogsTableProps {
  locationId?: string
  className?: string
}

export function InventoryLogsTable({ locationId, className }: InventoryLogsTableProps) {
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'AUTO' | 'MANUAL'>('ALL')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const loadLogs = async (reset = false) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: '20',
        offset: (reset ? 0 : page * 20).toString(),
      })

      if (locationId) {
        params.append('locationId', locationId)
      }

      if (typeFilter !== 'ALL') {
        params.append('type', typeFilter)
      }

      const response = await fetch(`/api/inventory/logs?${params}`)
      const data = await response.json()

      if (data.success) {
        if (reset) {
          setLogs(data.data)
          setPage(0)
        } else {
          setLogs(prev => [...prev, ...data.data])
        }
        setHasMore(data.pagination.hasMore)
      } else {
        setError(data.error || 'Failed to load inventory logs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory logs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs(true)
  }, [locationId, typeFilter])

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
    loadLogs(false)
  }

  const handleRefresh = () => {
    loadLogs(true)
  }

  const getTypeVariant = (type: 'AUTO' | 'MANUAL') => {
    return type === 'AUTO' ? 'secondary' : 'default'
  }

  const getTypeIcon = (type: 'AUTO' | 'MANUAL') => {
    return type === 'AUTO' ? <RefreshCw className="h-3 w-3" /> : <User className="h-3 w-3" />
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Inventory Logs
            </CardTitle>
            <CardDescription>
              Track all inventory changes including automatic and manual updates
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={(value: 'ALL' | 'AUTO' | 'MANUAL') => setTypeFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="AUTO">Auto Only</SelectItem>
                <SelectItem value="MANUAL">Manual Only</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Items Updated</TableHead>
                <TableHead>Reason/Order</TableHead>
                <TableHead>Updated By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No inventory logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(log.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'hh:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeVariant(log.type)} className="flex items-center gap-1 w-fit">
                        {getTypeIcon(log.type)}
                        {log.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {log.updates.map((update, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{update.ingredient_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {update.previousStock !== undefined && update.newStock !== undefined ? (
                                <>
                                  {update.previousStock} → {update.newStock} {update.unit}
                                  <span className={`ml-1 ${update.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ({update.quantity > 0 ? '+' : ''}{update.quantity})
                                  </span>
                                </>
                              ) : (
                                <>
                                  {Math.abs(update.quantity)} {update.unit}
                                  <span className={`ml-1 ${update.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ({update.quantity > 0 ? '+' : ''}{update.quantity})
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.type === 'MANUAL' ? (
                        <div className="text-sm">
                          <div className="font-medium text-orange-600">Manual Update</div>
                          {log.reason && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {log.reason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div className="font-medium text-blue-600">Order Processing</div>
                          {log.order_id && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Order: {log.order_id}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {log.profiles?.full_name || 'System'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading logs...</span>
          </div>
        )}

        {hasMore && !isLoading && logs.length > 0 && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={handleLoadMore}>
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
