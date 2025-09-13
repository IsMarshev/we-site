import { useState } from 'react'
import { api } from '../lib/api'
import './Contact.css'

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
    <section className="contact-page" style={{padding: "0 12px"}}>
      <header className="contact-hero">
        <h2>Свяжитесь с нами</h2>
        <p>Вопросы о маршрутах, местах и сервисах — напишите нам, мы поможем спланировать идеальную поездку.</p>
      </header>

      <div className="contact-grid">
        <div className="contact-info card">
          <h3>Контактная информация</h3>
          <ul>
            <li><span>📍</span> Cape Town Visitor Centre, V&A Waterfront, Cape Town, 8001</li>
            <li><span>✉️</span> <a href="mailto:hello@capetown.travel">hello@capetown.travel</a></li>
            <li><span>☎️</span> <a href="tel:+27215550000">+27 (21) 555‑0000</a></li>
            <li><span>🕒</span> Пн–Пт 09:00–18:00, Сб–Вс 10:00–16:00</li>
          </ul>
          <div className="socials">
            <a href="#" aria-label="Instagram">📷 Instagram</a>
            <a href="#" aria-label="Facebook">f Facebook</a>
            <a href="#" aria-label="Telegram">✈️ Telegram</a>
          </div>
          <div className="map-embed">
            <iframe
              title="Cape Town Map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=18.38%2C-33.98%2C18.46%2C-33.90&layer=mapnik&marker=-33.9249%2C18.4241"
              style={{border:0}}
              loading="lazy"
            />
          </div>
        </div>

        <div className="contact-form card">
          <h3>Написать нам</h3>
          <form onSubmit={submit} className="form">
            <input required placeholder="Имя" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            <textarea required rows={6} placeholder="Сообщение" value={form.message} onChange={e=>setForm({...form, message:e.target.value})} />
            <button type="submit">Отправить</button>
            {status==='loading' && <span className="muted">Отправка…</span>}
            {status==='success' && <span className="ok">Спасибо! Сообщение отправлено.</span>}
            {status==='error' && <span className="err">Ошибка отправки. Попробуйте позже.</span>}
          </form>
        </div>
      </div>
    </section>
  )
}
