import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface LocationState {
  selectedLocation: string
  locations: Array<{
    id: string
    name: string
    isActive: boolean
  }>
}

const initialState: LocationState = {
  selectedLocation: 'all',
  locations: [
    { id: 'downtown', name: 'Downtown', isActive: true },
    { id: 'uptown', name: 'Uptown', isActive: true }
  ]
}

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<string>) => {
      state.selectedLocation = action.payload
    },
    setLocations: (state, action: PayloadAction<LocationState['locations']>) => {
      state.locations = action.payload
    }
  }
})

export const { setSelectedLocation, setLocations } = locationSlice.actions
export default locationSlice.reducer
