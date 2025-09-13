import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (form.password.length < 6) throw new Error('Пароль должен быть не короче 6 символов')
      await register(form)
      navigate('/add')
    } catch (e) {
      setError(e.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Регистрация</h2>
      <form onSubmit={submit} style={{display:'grid', gap:10, maxWidth:420}}>
        <input required minLength={3} placeholder="Имя пользователя (мин. 3)" value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
        <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input required type="password" minLength={6} placeholder="Пароль (мин. 6 символов)" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        <button type="submit" disabled={loading}>{loading ? 'Создаём…' : 'Зарегистрироваться'}</button>
        {error && <div style={{color:'crimson'}}>{error}</div>}
      </form>
      <p style={{marginTop:8}}>Уже есть аккаунт? <Link to="/login">Войдите</Link></p>
    </section>
  )
}
