import { useEffect, useMemo, useRef, useState } from 'react'
import MapView from '../components/MapView'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Places.css'

export default function Places() {
  const [places, setPlaces] = useState([])
  const [selected, setSelected] = useState(null)
  const [commentForm, setCommentForm] = useState({ author: '', content: '' })
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const commentsRef = useRef(null)
  const { user } = useAuth()
  const [reactions, setReactions] = useState({}) // id -> {likes, dislikes, my}
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('name') // name | newest | liked

  useEffect(() => { (async () => {
    const data = await api.listPlaces()
    setPlaces(data)
    setLoading(false)
    // load reactions
    const pairs = await Promise.all(data.map(async (p) => [p.id, await api.getPlaceReactions(p.id)]))
    const map = Object.fromEntries(pairs)
    setReactions(map)
  })() }, [])

  useEffect(() => { (async () => {
    if (!selected) return
    const data = await api.listComments(selected.id)
    setComments(data)
  })() }, [selected?.id])

  const displayed = useMemo(() => {
    let list = places
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    }
    if (sortBy === 'name') {
      list = [...list].sort((a,b)=> a.name.localeCompare(b.name))
    } else if (sortBy === 'newest') {
      list = [...list].sort((a,b)=> b.id - a.id)
    } else if (sortBy === 'liked') {
      list = [...list].sort((a,b)=> (reactions[b.id]?.likes||0) - (reactions[a.id]?.likes||0))
    }
    return list
  }, [places, query, sortBy, reactions])

  const positions = displayed

  const addComment = async (e) => {
    e.preventDefault()
    if (!selected) return
    const saved = await api.createComment(selected.id, commentForm)
    setCommentForm({ author:'', content:'' })
    setComments([saved, ...comments])
  }

  const onSelectPlace = (p) => {
    setSelected(p)
    setTimeout(() => {
      commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const react = async (id, value) => {
    if (!user) return alert('Войдите, чтобы ставить оценки')
    const r = await api.reactPlace(id, value)
    setReactions(prev => ({ ...prev, [id]: r }))
  }

  return (
    <section>
      <h2>Интересные места</h2>
      {loading ? <p>Загрузка...</p> : (
        <>
          <MapView places={positions} onSelect={onSelectPlace} />
          <div className="places-controls">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по названию или описанию" />
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="name">По названию</option>
              <option value="newest">Сначала новые</option>
              <option value="liked">Сначала популярные</option>
            </select>
          </div>
          <div className="places-list">
            {displayed.map(p => (
              <div key={p.id} className="place-card" onClick={()=>onSelectPlace(p)}>
                <div className="place-img">
                  <img src={p.image_url || 'https://placehold.co/800x450?text=No+Image'} alt={p.name} />
                </div>
                <div className="place-body">
                  <div className="place-title-row">
                    <h3>{p.name}</h3>
                    {user && (user.role === 'admin' || p.created_by === user.id) && (
                      <Link to={`/places/${p.id}/edit`} onClick={(e)=>e.stopPropagation()} className="edit-link">Редактировать</Link>
                    )}
                  </div>
                  <p className="place-desc">{p.description}</p>
                  <div className="place-actions" onClick={(e)=>e.stopPropagation()}>
                    <button onClick={()=>react(p.id, 1)} className={reactions[p.id]?.my===1? 'btn-like active' : 'btn-like'}>
                      <span>👍</span>
                      <span className="num like">{reactions[p.id]?.likes ?? 0}</span>
                    </button>
                    <button onClick={()=>react(p.id, -1)} className={reactions[p.id]?.my===-1? 'btn-dislike active' : 'btn-dislike'}>
                      <span>👎</span>
                      <span className="num dislike">{reactions[p.id]?.dislikes ?? 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {displayed.length === 0 && (
              <div className="muted">Ничего не найдено по фильтрам.</div>
            )}
          </div>

          <div ref={commentsRef} style={{marginTop:24}}>
            <h3>Комментарии</h3>
            {!selected && <div style={{color:'#678'}}>Выберите место, чтобы просмотреть и добавить комментарии.</div>}
            {selected && (
              <div>
                <div style={{display:'grid', gridTemplateColumns:'200px 1fr', gap:12, alignItems:'center', marginBottom:8}}>
                  <img src={selected.image_url || 'https://placehold.co/400x300?text=No+Image'} alt={selected.name} style={{width:'100%', height:120, objectFit:'cover', borderRadius:10}} />
                  <div>
                    <h4 style={{margin:'4px 0'}}>{selected.name}</h4>
                    <div style={{color:'#567'}}>{selected.description}</div>
                  </div>
                </div>
                <form onSubmit={addComment} style={{display:'grid', gap:8, marginBottom:8}}>
                  <input required placeholder="Ваше имя" value={commentForm.author} onChange={e=>setCommentForm({...commentForm, author:e.target.value})}/>
                  <textarea required rows={3} placeholder="Комментарий" value={commentForm.content} onChange={e=>setCommentForm({...commentForm, content:e.target.value})}/>
                  <button type="submit">Добавить комментарий</button>
                </form>
                <div style={{display:'grid', gap:8}}>
                  {comments.map(c => (
                    <div key={c.id} style={{padding:8, border:'1px solid #eee', borderRadius:8}}>
                      <div style={{fontWeight:600}}>{c.author}</div>
                      <div>{c.content}</div>
                    </div>
                  ))}
                  {comments.length===0 && <div style={{color:'#678'}}>Пока нет комментариев.</div>}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
