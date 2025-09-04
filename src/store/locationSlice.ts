import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface LocationState {
  selectedLocation: string
  locations: Array<{
    id: string
    name: string
    is_active: boolean
  }>
}

const initialState: LocationState = {
  selectedLocation: 'all',
  locations: [
    { id: 'downtown', name: 'Downtown', is_active: true },
    { id: 'uptown', name: 'Uptown', is_active: true }
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
