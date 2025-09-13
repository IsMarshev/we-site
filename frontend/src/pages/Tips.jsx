import { Link } from 'react-router-dom'
import './Tips.css'

export default function Tips() {
  const checklist = `Кейптаун — чек-лист
\nДокументы и финансы:
• Паспорт, виза (если нужна)
• Медстраховка
• Банковские карты + немного наличных ZAR
\nСвязь и софт:
• eSIM/сим-карта местного оператора (MTN/Vodacom)
• Офлайн-карты (Google Maps/Maps.me)
\nСнаряжение:
• Ветровка, кепка, солнцезащитный крем SPF 50
• Удобная обувь для хайкинга
• Пауэрбанк
\nПлан:
• Table Mountain утром
• Кап Поинт + пингвины на Boulders Beach
• Закат на Signal Hill/Camps Bay\n`

  const downloadChecklist = () => {
    const blob = new Blob([checklist], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'CapeTown-Checklist.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="tips">
      <header className="tips-hero">
        <h2>Советы путешественникам</h2>
        <p>Собрали главное: когда ехать, как передвигаться, где безопасно и что взять с собой.</p>
        <nav className="tips-nav">
          <a href="#when">Когда ехать</a>
          <a href="#transport">Транспорт</a>
          <a href="#safety">Безопасность</a>
          <a href="#money">Деньги</a>
          <a href="#connect">Связь</a>
          <a href="#hiking">Хайкинг</a>
          <a href="#beach">Пляжи</a>
          <a href="#help">Экстренные</a>
        </nav>
      </header>

      <div className="tips-grid">
        <div className="card" id="facts">
          <h3>Коротко о главном</h3>
          <div className="facts">
            <div className="fact">
              <div className="k">Валюта</div>
              <div className="v">ZAR (ранда)</div>
            </div>
            <div className="fact">
              <div className="k">Розетки</div>
              <div className="v">Тип M (нужен адаптер)</div>
            </div>
            <div className="fact">
              <div className="k">Языки</div>
              <div className="v">англ. повсеместно</div>
            </div>
            <div className="fact">
              <div className="k">Левостороннее</div>
              <div className="v">вождение</div>
            </div>
          </div>
        </div>

        <div className="card" id="when">
          <h3>Когда ехать</h3>
          <p>Лето (декабрь–март) — тепло, много ветра; зима (июнь–август) — прохладнее, возможны дожди, меньше туристов. Лучшие месяцы для панорам и пляжа — октябрь–апрель.</p>
          <div className="months">
            {['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'].map((m,i)=> (
              <span key={i} className={i<=3||i>=9 ? 'hot' : (i>=4&&i<=8?'mild':'hot')}>{m}</span>
            ))}
          </div>
          <small className="muted">Вода в океане прохладная круглый год (13–18°C). На Мысе и в Camps Bay — холоднее, на False Bay — теплее.</small>
        </div>

        <div className="card" id="transport">
          <h3>Транспорт</h3>
          <ul className="bullets">
            <li><b>Uber/Bolt</b> — самый простой и безопасный способ по городу и на вечерние перемещения.</li>
            <li><b>Аренда авто</b> — удобно для Кейп-Пойнта, винных ферм и пляжей. Движение левостороннее, парковки платные в центре.</li>
            <li><b>MyCiTi</b> — городской автобус по ключевым маршрутам; удобно днём.</li>
            <li><b>Hop-on Hop-off</b> — туристические двухэтажные автобусы, чтобы «осмотреться» в первый день.</li>
          </ul>
          <div className="hint">Смотрите <Link to="/places">интересные места</Link> и стройте свой маршрут.</div>
        </div>

        <div className="card" id="safety">
          <h3>Безопасность</h3>
          <ul className="bullets">
            <li>Держитесь оживлённых улиц, особенно вечером; пользуйтесь такси ночью.</li>
            <li>Не демонстрируйте дорогую технику и украшения, носите рюкзак спереди в толпе.</li>
            <li>На тропах ходите днём и по популярным маршрутам; предупредите кого-то о плане.</li>
            <li>На пляже следите за флагами спасателей и течениями, не оставляйте вещи без присмотра.</li>
          </ul>
        </div>

        <div className="card" id="money">
          <h3>Деньги и оплата</h3>
          <ul className="bullets">
            <li>Карты принимают почти везде; Apple/Google Pay работают. Иметь немного наличных на базары/чаевые.</li>
            <li>Средний бюджет: от 40–60$ в день (эконом) до 120–200$ (комфорт) без перелёта.</li>
            <li>Чаевые: 10% в ресторанах, 5–10 ZAR парковщикам/носильщикам.</li>
          </ul>
        </div>

        <div className="card" id="connect">
          <h3>Связь и интернет</h3>
          <ul className="bullets">
            <li>Купите eSIM или SIM MTN/Vodacom. Тарифы выгоднее в салонах операторов.</li>
            <li>Поставьте офлайн‑карты и сохраните адрес проживания.</li>
          </ul>
        </div>

        <div className="card" id="hiking">
          <h3>Хайкинг и горы</h3>
          <ul className="bullets">
            <li>На Table Mountain лучше утром: меньше облаков и жары. Проверьте погоду (облачность/ветер).</li>
            <li>Возьмите воду, ветровку, кепку, крем SPF 50. На маршрутах бывает сильный ветер.</li>
            <li>Популярные тропы: Platteklip Gorge (вверх на Table Mountain), Lion’s Head, Signal Hill (закаты).</li>
          </ul>
        </div>

        <div className="card" id="beach">
          <h3>Пляжи и океан</h3>
          <ul className="bullets">
            <li>Вода холодная почти всегда; на False Bay ощутимо теплее, чем на Атлантике.</li>
            <li>Ориентируйтесь на флаги спасателей: зелёный — ок, жёлтый — осторожно, красный — нельзя купаться.</li>
            <li>Сильные течения: купайтесь в зонах со спасателями, не заплывайте далеко.</li>
          </ul>
        </div>

        <div className="card" id="help">
          <h3>Экстренные контакты</h3>
          <ul className="bullets">
            <li>Общий номер экстренных служб: <b>112</b> (мобильный).</li>
            <li>Полиция: <b>10111</b>, Скорая: <b>10177</b>.</li>
            <li>Сохраните контакты страховой и адрес проживания.</li>
          </ul>
          <div className="hint">
            Скачайте офлайн‑чек‑лист: <button className="linklike" onClick={downloadChecklist}>скачать TXT</button>
          </div>
        </div>
      </div>
    </section>
  )
}
