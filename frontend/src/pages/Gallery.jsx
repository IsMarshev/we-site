import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import './Gallery.css'

export default function Gallery() {
  const [items, setItems] = useState([])
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const { user } = useAuth()
  const [reactions, setReactions] = useState({})
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest | liked | title

  const load = async () => {
    const data = await api.listGallery()
    setItems(data)
    const pairs = await Promise.all(data.map(async (it) => [it.id, await api.getImageReactions(it.id)]))
    setReactions(Object.fromEntries(pairs))
  }

  useEffect(() => { load() }, [])

  const displayed = useMemo(() => {
    let list = items
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(it => (it.title || '').toLowerCase().includes(q))
    }
    if (sortBy === 'title') {
      list = [...list].sort((a,b)=> (a.title||'').localeCompare(b.title||''))
    } else if (sortBy === 'liked') {
      list = [...list].sort((a,b)=> (reactions[b.id]?.likes||0) - (reactions[a.id]?.likes||0))
    } else {
      list = [...list].sort((a,b)=> b.id - a.id)
    }
    return list
  }, [items, query, sortBy, reactions])

  const addByUrl = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await api.addGalleryUrl({ image_url: url, title })
      setUrl(''); setTitle('')
      await load()
      setStatus('ok')
    } catch (e) {
      setStatus('error')
    }
  }

  const upload = async (e) => {
    e.preventDefault()
    if (!file) return
    setStatus('loading')
    try {
      await api.uploadGallery(file, title)
      setFile(null); setTitle('')
      await load()
      setStatus('ok')
    } catch (e) {
      setStatus('error')
    }
  }

  const react = async (id, value) => {
    const r = await api.reactImage(id, value)
    setReactions(prev => ({ ...prev, [id]: r }))
  }

  const remove = async (id) => {
    if (!user || user.role !== 'admin') return
    if (!confirm('Удалить фото? Это действие необратимо.')) return
    try {
      await api.deleteGalleryImage(id)
      // Обновим локально без перезагрузки всех реакций
      setItems(prev => prev.filter(it => it.id !== id))
      const copy = { ...reactions }
      delete copy[id]
      setReactions(copy)
    } catch (e) {
      alert('Не удалось удалить фото')
    }
  }

  return (
    <section style={{padding: "0 12px"}}>
      <h2>Фотогалерея</h2>
      {user && user.role === 'admin' && (
        <div className="gallery-forms">
          <form onSubmit={addByUrl} className="g-form">
            <h3>Добавить по ссылке</h3>
            <input placeholder="Заголовок (необязательно)" value={title} onChange={e=>setTitle(e.target.value)} />
            <input required placeholder="Ссылка на изображение" value={url} onChange={e=>setUrl(e.target.value)} />
            <button type="submit">Добавить</button>
          </form>
          <form onSubmit={upload} className="g-form">
            <h3>Загрузить файл</h3>
            <input placeholder="Заголовок (необязательно)" value={title} onChange={e=>setTitle(e.target.value)} />
            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
            <button type="submit" disabled={!file}>Загрузить</button>
          </form>
        </div>
      )}
      <div className="gallery-controls">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по названию" />
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="newest">Сначала новые</option>
          <option value="liked">Сначала популярные</option>
          <option value="title">По названию</option>
        </select>
      </div>
      <div className="gallery-grid">
        {displayed.map((it) => (
          <figure key={it.id} className="g-item">
            {user?.role === 'admin' && (
              <button className="g-delete" onClick={()=>remove(it.id)} title="Удалить">
                🗑️
              </button>
            )}
            <div className="g-thumb">
              <img src={it.image_url} alt={it.title || 'photo'} />
            </div>
            {it.title && <figcaption className="g-caption">{it.title}</figcaption>}
            <div className="g-actions">
              <button onClick={()=>react(it.id, 1)} className={reactions[it.id]?.my===1? 'btn-like active' : 'btn-like'}>
                <span>👍</span>
                <span className="num like">{reactions[it.id]?.likes ?? 0}</span>
              </button>
              <button onClick={()=>react(it.id, -1)} className={reactions[it.id]?.my===-1? 'btn-dislike active' : 'btn-dislike'}>
                <span>👎</span>
                <span className="num dislike">{reactions[it.id]?.dislikes ?? 0}</span>
              </button>
            </div>
          </figure>
        ))}
        {displayed.length === 0 && (
          <div style={{color:'#678'}}>Пока нет фотографий. {user?.role === 'admin' ? 'Добавьте первые!' : 'Обратитесь к администратору, чтобы добавить.'}</div>
        )}
      </div>
      {status==='error' && <div style={{color:'crimson', marginTop:8}}>Ошибка. Проверьте вход и данные.</div>}
    </section>
  )
}
