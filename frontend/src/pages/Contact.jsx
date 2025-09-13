import { useState } from 'react'
import { api } from '../lib/api'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await api.createContact(form)
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch (e) {
      setStatus('error')
    }
  }

  return (
    <section>
      <h2>Контакты</h2>
      <p>Оставьте сообщение — мы свяжемся с вами по email.</p>
      <form onSubmit={submit} style={{display:'grid', gap:10, maxWidth:520}}>
        <input required placeholder="Имя" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <textarea required rows={5} placeholder="Сообщение" value={form.message} onChange={e=>setForm({...form, message:e.target.value})} />
        <button type="submit">Отправить</button>
        {status==='loading' && <span>Отправка...</span>}
        {status==='success' && <span style={{color:'green'}}>Спасибо! Сообщение отправлено.</span>}
        {status==='error' && <span style={{color:'crimson'}}>Ошибка отправки. Попробуйте позже.</span>}
      </form>
    </section>
  )
}

