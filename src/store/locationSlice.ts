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
    { id: 'loc_001', name: 'SavorSync Downtown', isActive: true },
    { id: 'loc_002', name: 'SavorSync Marina', isActive: true },
    { id: 'loc_003', name: 'SavorSync Mission', isActive: true }
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
