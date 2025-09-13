import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(form.username, form.password)
      navigate('/add')
    } catch (e) {
      setError(e.message || 'Неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{padding: "0 12px"}}>
      <h2>Вход</h2>
      <form onSubmit={submit} style={{display:'grid', gap:10, maxWidth:360}}>
        <input required placeholder="Имя пользователя" value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
        <input required type="password" placeholder="Пароль" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        <button type="submit" disabled={loading}>{loading ? 'Входим…' : 'Войти'}</button>
        {error && <div style={{color:'crimson'}}>{error}</div>}
      </form>
      <p style={{marginTop:8}}>Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link></p>
    </section>
  )
}
