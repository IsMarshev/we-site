import { Link, NavLink } from 'react-router-dom'
import './NavBar.css'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  return (
    <header className="navbar">
      <div className="brand">
        <Link to="/">Cape Town Travel</Link>
      </div>
      <nav>
        <NavLink to="/" end>Главная</NavLink>
        <NavLink to="/places">Интересные места</NavLink>
        <NavLink to="/tips">Советы</NavLink>
        <NavLink to="/gallery">Фотогалерея</NavLink>
        <NavLink to="/contact">Контакты</NavLink>
        {user ? (
          <>
            {user.role === 'admin' && <NavLink to="/add">Добавить место</NavLink>}
            <span style={{marginLeft:8, color:'#9fd'}}>Привет, {user.username}</span>
            <button onClick={logout} style={{marginLeft:8, background:'transparent', color:'#cde', border:'1px solid #456'}}>Выйти</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Войти</NavLink>
            <NavLink to="/register">Регистрация</NavLink>
          </>
        )}
      </nav>
    </header>
  )
}
