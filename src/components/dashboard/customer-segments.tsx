'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PlusCircle, Users, Calendar, DollarSign, ShoppingBag, MapPin } from 'lucide-react'

interface SegmentStats {
  id: string
  name: string
  description: string
  count: number
  percentage: number
  criteria: string
}

export function CustomerSegments() {
  const [segments, setSegments] = useState<SegmentStats[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [newSegmentName, setNewSegmentName] = useState('')
  const [newSegmentDescription, setNewSegmentDescription] = useState('')
  const [newSegmentCriteria, setNewSegmentCriteria] = useState('frequency')
  const [newSegmentValue, setNewSegmentValue] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchSegmentsData()
  }, [])

  async function fetchSegmentsData() {
    setLoading(true)
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Get the user's organization
      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (!userOrg) {
        throw new Error('Organization not found')
      }

      // Get total customers count
      const { count } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', userOrg.organization_id)
      
      setTotalCustomers(count || 0)

      // Get segments
      const { data: segmentsData } = await supabase
        .from('customer_segments')
        .select('*')
        .eq('organization_id', userOrg.organization_id)
        .order('created_at', { ascending: false })

      // For each segment, get the count of customers
      const segmentsWithStats = await Promise.all((segmentsData || []).map(async (segment) => {
        // In a real app, we would use the segment criteria to query customers
        // For now, we'll simulate with random counts
        const segmentCount = Math.floor(Math.random() * (count || 100))
        
        return {
          id: segment.id,
          name: segment.name,
          description: segment.description,
          count: segmentCount,
          percentage: count ? Math.round((segmentCount / count) * 100) : 0,
          criteria: segment.criteria
        }
      }))

      // Add default segments if none exist
      if (!segmentsData || segmentsData.length === 0) {
        const defaultSegments = [
          {
            id: 'new-customers',
            name: 'New Customers',
            description: 'Customers who joined in the last 30 days',
            count: Math.floor(Math.random() * (count || 100)),
            percentage: 0,
            criteria: 'created_at > now() - interval \'30 days\''
          },
          {
            id: 'frequent-visitors',
            name: 'Frequent Visitors',
            description: 'Customers who visit more than once a week',
            count: Math.floor(Math.random() * (count || 100)),
            percentage: 0,
            criteria: 'visit_frequency > 4'
          },
          {
            id: 'high-spenders',
            name: 'High Spenders',
            description: 'Customers who spend above average per visit',
            count: Math.floor(Math.random() * (count || 100)),
            percentage: 0,
            criteria: 'avg_order_value > 50'
          }
        ]

        // Calculate percentages
        defaultSegments.forEach(segment => {
          segment.percentage = count ? Math.round((segment.count / count) * 100) : 0
        })

        setSegments(defaultSegments)
      } else {
        setSegments(segmentsWithStats)
      }
    } catch (error) {
      console.error('Error fetching segments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSegment = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Get the user's organization
      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (!userOrg) {
        throw new Error('Organization not found')
      }

      // Build the criteria string based on the selected type
      let criteriaString = ''
      switch (newSegmentCriteria) {
        case 'frequency':
          criteriaString = `visit_frequency > ${newSegmentValue}`
          break
        case 'spending':
          criteriaString = `avg_order_value > ${newSegmentValue}`
          break
        case 'location':
          criteriaString = `city = '${newSegmentValue}'`
          break
        case 'recent':
          criteriaString = `created_at > now() - interval '${newSegmentValue} days'`
          break
      }

      // Insert the new segment
      const { error } = await supabase
        .from('customer_segments')
        .insert({
          organization_id: userOrg.organization_id,
          name: newSegmentName,
          description: newSegmentDescription,
          criteria: criteriaString,
          created_by: user.id
        })

      if (error) throw error
      
      // Reset form and refresh data
      setNewSegmentName('')
      setNewSegmentDescription('')
      setNewSegmentCriteria('frequency')
      setNewSegmentValue('')
      fetchSegmentsData()
    } catch (error) {
      console.error('Error creating segment:', error)
    }
  }

  const getSegmentIcon = (segmentId: string) => {
    if (segmentId.includes('new')) return <Calendar className="h-5 w-5" />
    if (segmentId.includes('frequent')) return <Users className="h-5 w-5" />
    if (segmentId.includes('high') || segmentId.includes('spend')) return <DollarSign className="h-5 w-5" />
    if (segmentId.includes('location')) return <MapPin className="h-5 w-5" />
    return <ShoppingBag className="h-5 w-5" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Customer Segments</h3>
          <p className="text-sm text-muted-foreground">
            Group your customers based on behavior and attributes
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Segment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Customer Segment</DialogTitle>
              <DialogDescription>
                Define a new customer segment based on specific criteria
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Segment Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Weekend Regulars"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe this customer segment"
                  value={newSegmentDescription}
                  onChange={(e) => setNewSegmentDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="criteria">Criteria Type</Label>
                  <Select 
                    value={newSegmentCriteria} 
                    onValueChange={setNewSegmentCriteria}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select criteria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frequency">Visit Frequency</SelectItem>
                      <SelectItem value="spending">Spending Amount</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="recent">Recent Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    placeholder={
                      newSegmentCriteria === 'frequency' ? 'e.g., 3 (visits)' :
                      newSegmentCriteria === 'spending' ? 'e.g., 50 (dollars)' :
                      newSegmentCriteria === 'location' ? 'e.g., New York' :
                      'e.g., 30 (days)'
                    }
                    value={newSegmentValue}
                    onChange={(e) => setNewSegmentValue(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateSegment}>Create Segment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Segments</TabsTrigger>
          <TabsTrigger value="behavior">Behavior-based</TabsTrigger>
          <TabsTrigger value="demographic">Demographic</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading segments...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {segments.map((segment) => (
                <Card key={segment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                          {getSegmentIcon(segment.id)}
                        </div>
                        <CardTitle className="text-base">{segment.name}</CardTitle>
                      </div>
                      <div className="text-2xl font-bold">{segment.count}</div>
                    </div>
                    <CardDescription>{segment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span>Percentage of customers</span>
                      <span className="font-medium">{segment.percentage}%</span>
                    </div>
                    <Progress value={segment.percentage} className="mt-2" />
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      View Customers
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="behavior">
          <div className="text-center py-8 text-muted-foreground">
            Filter to view behavior-based segments
          </div>
        </TabsContent>
        
        <TabsContent value="demographic">
          <div className="text-center py-8 text-muted-foreground">
            Filter to view demographic-based segments
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
