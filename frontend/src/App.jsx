import { Routes, Route } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Places from './pages/Places'
import Tips from './pages/Tips'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import AddPlace from './pages/AddPlace'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider } from './context/AuthContext'
import EditPlace from './pages/EditPlace'

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <NavBar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/places" element={<Places />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/add" element={<AddPlace />} />
            <Route path="/places/:id/edit" element={<EditPlace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <footer className="footer">© {new Date().getFullYear()} Cape Town Travel</footer>
      </div>
    </AuthProvider>
  )
}

export default App
