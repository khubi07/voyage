import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { MyTrip } from '@/pages/MyTrip'
import { Concierge } from '@/pages/Concierge'
import { Explore } from '@/pages/Explore'
import { PlaceDetails } from '@/pages/PlaceDetails'
import { Saved } from '@/pages/Saved'
import { ToastProvider } from '@/components/ui/Toast'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/trip" element={<MyTrip />} />
            <Route path="/concierge" element={<Concierge />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/place/:id" element={<PlaceDetails />} />
            <Route path="/saved" element={<Saved />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
