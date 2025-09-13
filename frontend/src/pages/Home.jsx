import { Link } from 'react-router-dom'
import { useState } from 'react'
import './Home.css'

export default function Home() {
  // Положите ваш видеофайл сюда: frontend/public/media/hero.mp4
  // Можно переопределить через VITE_HERO_VIDEO и VITE_HERO_POSTER
  const videoSrc = import.meta.env.VITE_HERO_VIDEO || '/media/hero.mp4'
  const webmSrc = import.meta.env.VITE_HERO_VIDEO_WEBM || '/media/hero.webm'
  const poster = import.meta.env.VITE_HERO_POSTER || '/media/hero-poster.webp'
  const [videoError, setVideoError] = useState(false)

  return (
    <section className="home">
      <div className="hero hero-fullbleed">
        {!videoError && (
          <video
            className="hero-video-el"
            poster={poster}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
          >
            <source src={webmSrc} type="video/webm" />
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
        {videoError && <div className="hero-bg" style={{ backgroundImage: `url(${poster})` }} />}
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Путешествия по Кейптауну</h1>
          <p>Морские горизонты, горные тропы и городская магия</p>
          <div className="hero-actions">
            <Link to="/places" className="btn btn-primary">Открыть карту мест</Link>
            <Link to="/gallery" className="btn">Смотреть галерею</Link>
          </div>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">📍</div>
          <h3>Интересные места</h3>
          <p>От Столовой горы до мысов: отмечайте и обсуждайте лучшие локации города и побережья.</p>
          <Link to="/places" className="link">Перейти к местам →</Link>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🧭</div>
          <h3>Советы и маршруты</h3>
          <p>Практичные рекомендации по погоде, безопасности и транспорту, чтобы поездка прошла идеально.</p>
          <Link to="/tips" className="link">Читать советы →</Link>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📸</div>
          <h3>Фотогалерея</h3>
          <p>Лучшие кадры Кейптауна: делитесь снимками и оценивайте фотографии других путешественников.</p>
          <Link to="/gallery" className="link">Открыть галерею →</Link>
        </div>
      </div>

      <div className="cta">
        <h2>Готовы исследовать Кейптаун?</h2>
        <p>Соберите свой маршрут из любимых мест и поделитесь впечатлениями с сообществом.</p>
        <div className="hero-actions">
          <Link to="/places" className="btn btn-primary">Начать с карты</Link>
          <Link to="/contact" className="btn">Связаться с нами</Link>
        </div>
      </div>
    </section>
  )
}
