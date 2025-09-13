import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import MapPicker from '../components/MapPicker'

export default function AddPlace() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name:'', description:'', latitude:'', longitude:'', image_url:'' })
  const [status, setStatus] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const payload = { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) }
      await api.createPlace(payload)
      setStatus('success')
      setForm({ name:'', description:'', latitude:'', longitude:'', image_url:'' })
    } catch (e) {
      setStatus('error')
    }
  }

  if (!user) {
    return (
      <section>
        <h2>Добавить место</h2>
        <p>Эта функция доступна после входа. Пожалуйста, войдите или зарегистрируйтесь.</p>
      </section>
    )
  }

  if (user.role !== 'admin') {
    return (
      <section>
        <h2>Добавить место</h2>
        <p>Только администраторы могут добавлять места.</p>
      </section>
    )
  }

  return (
    <section>
      <h2>Добавить новое место</h2>
      <form onSubmit={submit} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, maxWidth:800}}>
        <input required placeholder="Название" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input placeholder="Ссылка на фото" value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})}/>
        <textarea required placeholder="Описание" style={{gridColumn:'1/-1'}} rows={5} value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        <input required type="number" step="any" placeholder="Широта (lat)" value={form.latitude} onChange={e=>setForm({...form, latitude:e.target.value})}/>
        <input required type="number" step="any" placeholder="Долгота (lng)" value={form.longitude} onChange={e=>setForm({...form, longitude:e.target.value})}/>
        <div style={{gridColumn:'1/-1'}}>
          <MapPicker value={[parseFloat(form.latitude)||-33.9249, parseFloat(form.longitude)||18.4241]} onChange={([lat, lng])=>setForm({...form, latitude:String(lat), longitude:String(lng)})} />
        </div>
        <button type="submit" style={{gridColumn:'1/-1'}}>Добавить</button>
        {status==='loading' && <span>Сохраняем…</span>}
        {status==='success' && <span style={{color:'green'}}>Место добавлено!</span>}
        {status==='error' && <span style={{color:'crimson'}}>Ошибка. Проверьте данные и вход.</span>}
      </form>
    </section>
  )
}
