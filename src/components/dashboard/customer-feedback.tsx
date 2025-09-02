'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Flag, Send, PlusCircle } from 'lucide-react'

interface Feedback {
  id: string
  customer_name: string
  customer_email: string
  rating: number
  comment: string
  source: string
  created_at: string
  status: 'new' | 'reviewed' | 'responded'
  location_name?: string
}

export function CustomerFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [newFeedbackSource, setNewFeedbackSource] = useState('direct')
  const [newFeedbackCustomer, setNewFeedbackCustomer] = useState('')
  const [newFeedbackEmail, setNewFeedbackEmail] = useState('')
  const [newFeedbackRating, setNewFeedbackRating] = useState('5')
  const [newFeedbackComment, setNewFeedbackComment] = useState('')
  const [newFeedbackLocation, setNewFeedbackLocation] = useState('')
  const [locations, setLocations] = useState<{id: string, name: string}[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchFeedback()
    fetchLocations()
  }, [activeTab])

  async function fetchLocations() {
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

      // Get locations
      const { data } = await supabase
        .from('locations')
        .select('id, name')
        .eq('organization_id', userOrg.organization_id)
        .order('name')

      setLocations(data || [])
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  async function fetchFeedback() {
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

      // In a real app, we would fetch from a feedback table
      // For now, we'll create mock data
      const mockFeedback: Feedback[] = [
        {
          id: '1',
          customer_name: 'John Smith',
          customer_email: 'john.smith@example.com',
          rating: 5,
          comment: 'Excellent service and amazing food! Will definitely come back.',
          source: 'in-store',
          created_at: '2025-08-20T14:30:00Z',
          status: 'new',
          location_name: 'Downtown Location'
        },
        {
          id: '2',
          customer_name: 'Sarah Johnson',
          customer_email: 'sarah.j@example.com',
          rating: 4,
          comment: 'Food was great but service was a bit slow during peak hours.',
          source: 'online',
          created_at: '2025-08-19T18:45:00Z',
          status: 'reviewed',
          location_name: 'Westside Branch'
        },
        {
          id: '3',
          customer_name: 'Michael Brown',
          customer_email: 'mbrown@example.com',
          rating: 2,
          comment: 'My order was incorrect and it took too long to get it fixed.',
          source: 'online',
          created_at: '2025-08-18T12:15:00Z',
          status: 'responded',
          location_name: 'Downtown Location'
        },
        {
          id: '4',
          customer_name: 'Emily Davis',
          customer_email: 'emily.d@example.com',
          rating: 5,
          comment: 'The new seasonal menu is fantastic! Loved the chef\'s special.',
          source: 'in-store',
          created_at: '2025-08-17T20:30:00Z',
          status: 'new',
          location_name: 'Eastside Location'
        },
        {
          id: '5',
          customer_name: 'Robert Wilson',
          customer_email: 'rwilson@example.com',
          rating: 3,
          comment: 'Average experience. Food was good but nothing special.',
          source: 'online',
          created_at: '2025-08-16T13:20:00Z',
          status: 'reviewed',
          location_name: 'Westside Branch'
        }
      ]

      // Filter based on active tab
      let filteredFeedback = [...mockFeedback]
      if (activeTab === 'positive') {
        filteredFeedback = mockFeedback.filter(item => item.rating >= 4)
      } else if (activeTab === 'negative') {
        filteredFeedback = mockFeedback.filter(item => item.rating <= 2)
      } else if (activeTab === 'pending') {
        filteredFeedback = mockFeedback.filter(item => item.status === 'new')
      }

      setFeedback(filteredFeedback)
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFeedback = async () => {
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

      // In a real app, we would insert into a feedback table
      // For now, we'll just add to our local state
      const newFeedback: Feedback = {
        id: `new-${Date.now()}`,
        customer_name: newFeedbackCustomer,
        customer_email: newFeedbackEmail,
        rating: parseInt(newFeedbackRating),
        comment: newFeedbackComment,
        source: newFeedbackSource,
        created_at: new Date().toISOString(),
        status: 'new',
        location_name: locations.find(loc => loc.id === newFeedbackLocation)?.name
      }

      setFeedback([newFeedback, ...feedback])
      
      // Reset form
      setNewFeedbackCustomer('')
      setNewFeedbackEmail('')
      setNewFeedbackRating('5')
      setNewFeedbackComment('')
      setNewFeedbackLocation('')
      setNewFeedbackSource('direct')
    } catch (error) {
      console.error('Error adding feedback:', error)
    }
  }

  const getRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">New</Badge>
      case 'reviewed':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Reviewed</Badge>
      case 'responded':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Responded</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Customer Feedback</h3>
          <p className="text-sm text-muted-foreground">
            Review and respond to customer feedback across all channels
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Feedback
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Customer Feedback</DialogTitle>
              <DialogDescription>
                Record feedback received from customers through various channels
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input
                    id="customer"
                    placeholder="Full name"
                    value={newFeedbackCustomer}
                    onChange={(e) => setNewFeedbackCustomer(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    value={newFeedbackEmail}
                    onChange={(e) => setNewFeedbackEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="source">Feedback Source</Label>
                  <Select 
                    value={newFeedbackSource} 
                    onValueChange={setNewFeedbackSource}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct (in person)</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Select 
                    value={newFeedbackRating} 
                    onValueChange={setNewFeedbackRating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="3">3 - Average</SelectItem>
                      <SelectItem value="2">2 - Poor</SelectItem>
                      <SelectItem value="1">1 - Very Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Select 
                  value={newFeedbackLocation} 
                  onValueChange={setNewFeedbackLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comment">Feedback Comment</Label>
                <Textarea
                  id="comment"
                  placeholder="Customer's feedback"
                  value={newFeedbackComment}
                  onChange={(e) => setNewFeedbackComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddFeedback}>Add Feedback</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="positive">Positive</TabsTrigger>
          <TabsTrigger value="negative">Negative</TabsTrigger>
          <TabsTrigger value="pending">Pending Response</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading feedback...</div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No feedback found in this category
            </div>
          ) : (
            feedback.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarFallback>
                          {item.customer_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{item.customer_name}</CardTitle>
                        <CardDescription>{item.customer_email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(item.status)}
                      <div className="flex">
                        {getRatingStars(item.rating)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-sm text-muted-foreground">
                    <span className="font-medium">Source:</span> {item.source} • 
                    <span className="font-medium ml-2">Location:</span> {item.location_name} •
                    <span className="font-medium ml-2">Date:</span> {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <p className="text-sm">{item.comment}</p>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        Helpful
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="mr-1 h-4 w-4" />
                        Flag
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="mr-1 h-4 w-4" />
                        Reply
                      </Button>
                      <Button size="sm">
                        <Send className="mr-1 h-4 w-4" />
                        Mark as Responded
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="positive" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading feedback...</div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No positive feedback found
            </div>
          ) : (
            feedback.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarFallback>
                          {item.customer_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{item.customer_name}</CardTitle>
                        <CardDescription>{item.customer_email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(item.status)}
                      <div className="flex">
                        {getRatingStars(item.rating)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-sm text-muted-foreground">
                    <span className="font-medium">Source:</span> {item.source} • 
                    <span className="font-medium ml-2">Location:</span> {item.location_name} •
                    <span className="font-medium ml-2">Date:</span> {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <p className="text-sm">{item.comment}</p>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        Helpful
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="mr-1 h-4 w-4" />
                        Flag
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="mr-1 h-4 w-4" />
                        Reply
                      </Button>
                      <Button size="sm">
                        <Send className="mr-1 h-4 w-4" />
                        Mark as Responded
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="negative" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading feedback...</div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No negative feedback found
            </div>
          ) : (
            feedback.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarFallback>
                          {item.customer_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{item.customer_name}</CardTitle>
                        <CardDescription>{item.customer_email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(item.status)}
                      <div className="flex">
                        {getRatingStars(item.rating)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-sm text-muted-foreground">
                    <span className="font-medium">Source:</span> {item.source} • 
                    <span className="font-medium ml-2">Location:</span> {item.location_name} •
                    <span className="font-medium ml-2">Date:</span> {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <p className="text-sm">{item.comment}</p>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        Helpful
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="mr-1 h-4 w-4" />
                        Flag
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="mr-1 h-4 w-4" />
                        Reply
                      </Button>
                      <Button size="sm">
                        <Send className="mr-1 h-4 w-4" />
                        Mark as Responded
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading feedback...</div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending feedback found
            </div>
          ) : (
            feedback.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarFallback>
                          {item.customer_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{item.customer_name}</CardTitle>
                        <CardDescription>{item.customer_email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(item.status)}
                      <div className="flex">
                        {getRatingStars(item.rating)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-sm text-muted-foreground">
                    <span className="font-medium">Source:</span> {item.source} • 
                    <span className="font-medium ml-2">Location:</span> {item.location_name} •
                    <span className="font-medium ml-2">Date:</span> {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <p className="text-sm">{item.comment}</p>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        Helpful
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="mr-1 h-4 w-4" />
                        Flag
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="mr-1 h-4 w-4" />
                        Reply
                      </Button>
                      <Button size="sm">
                        <Send className="mr-1 h-4 w-4" />
                        Mark as Responded
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
