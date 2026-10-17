import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Layout from './components/Layout'
import Home from './pages/Home'
import Dua from './pages/Dua'
import Submit from './pages/Submit'
import Edit from './pages/Edit'
import Login from './pages/Login'
import UserDuas from './pages/UserDuas'
import Contributors from './pages/Contributors'
import Favourites from './pages/Favourites'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dua/:category/:slug" element={<Dua />} />
          <Route path="/edit/:category/:slug" element={<Edit />} />
          <Route path="/user/:username" element={<UserDuas />} />
          <Route path="/contributors" element={<Contributors />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
