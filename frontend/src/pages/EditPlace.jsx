import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import MapPicker from '../components/MapPicker'
import { useAuth } from '../context/AuthContext'

export default function EditPlace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [place, setPlace] = useState(null)
  const [form, setForm] = useState({ name:'', description:'', latitude:'', longitude:'', image_url:'' })
  const [status, setStatus] = useState('')

  useEffect(() => {
    (async () => {
      const pl = await api.getPlace(id)
      setPlace(pl)
      setForm({
        name: pl.name,
        description: pl.description,
        latitude: String(pl.latitude),
        longitude: String(pl.longitude),
        image_url: pl.image_url || ''
      })
      setLoading(false)
    })()
  }, [id])

  const submit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const payload = {
        name: form.name,
        description: form.description,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        image_url: form.image_url || null,
      }
      await api.updatePlace(id, payload)
      setStatus('success')
      setTimeout(()=>navigate('/places'), 800)
    } catch (e) {
      setStatus('error')
    }
  }

  const remove = async () => {
    if (!confirm('Удалить это место? Это действие необратимо.')) return
    try {
      await api.deletePlace(id)
      navigate('/places')
    } catch (e) {
      alert('Удаление не удалось. Возможно, у вас нет прав.')
    }
  }

  if (!user) {
    return <section><h2>Редактирование места</h2><p>Войдите, чтобы редактировать места.</p></section>
  }

  if (loading) return <section><h2>Редактирование места</h2><p>Загрузка…</p></section>

  if (place && !(user.role === 'admin' || place.created_by === user.id)) {
    return <section><h2>Редактирование места</h2><p>Недостаточно прав для редактирования этого места.</p></section>
  }

  return (
    <section>
      <h2>Редактировать место</h2>
      <form onSubmit={submit} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, maxWidth:800}}>
        <input required placeholder="Название" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input placeholder="Ссылка на фото" value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})}/>
        <textarea required placeholder="Описание" style={{gridColumn:'1/-1'}} rows={5} value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        <input required type="number" step="any" placeholder="Широта (lat)" value={form.latitude} onChange={e=>setForm({...form, latitude:e.target.value})}/>
        <input required type="number" step="any" placeholder="Долгота (lng)" value={form.longitude} onChange={e=>setForm({...form, longitude:e.target.value})}/>
        <div style={{gridColumn:'1/-1'}}>
          <MapPicker value={[parseFloat(form.latitude)||-33.9249, parseFloat(form.longitude)||18.4241]} onChange={([lat, lng])=>setForm({...form, latitude:String(lat), longitude:String(lng)})} />
        </div>
        <div style={{gridColumn:'1/-1', display:'flex', gap:12}}>
          <button type="submit">Сохранить</button>
          <button type="button" onClick={remove} style={{background:'#dc3545'}}>Удалить</button>
        </div>
        {status==='loading' && <span>Сохраняем…</span>}
        {status==='success' && <span style={{color:'green'}}>Изменения сохранены</span>}
        {status==='error' && <span style={{color:'crimson'}}>Ошибка сохранения</span>}
      </form>
    </section>
  )
}
