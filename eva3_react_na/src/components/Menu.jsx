import { useState } from 'react'
import { iniciarSesion, cerrarSesion, textoError } from '../api.js'

export default function Menu({ vista, setVista, usuario, setUsuario }) {
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  async function acceder(event) {
    event.preventDefault()
    const datos = new FormData(event.currentTarget)
    setCargando(true)
    setError('')
    try {
      await iniciarSesion(datos.get('username').trim(), datos.get('password'))
      setUsuario(datos.get('username').trim())
    } catch (err) { setError(textoError(err)) } finally { setCargando(false) }
  }
  if (!usuario) return <main className="login-screen">
    <div className="login-frame">
      <header className="login-brand">
        <div className="identity"><span className="brand-mark" aria-hidden="true">G<span>●</span></span><span><strong>Gasfitería</strong><small>DAVID GONZALEZ</small></span></div>
        <span className="access-label"><span aria-hidden="true">●</span> Acceso privado</span>
      </header>
      <div className="login-layout">
        <section className="login-story" aria-label="Bienvenida">
          <span className="eyebrow">MENOS GESTIONES. MÁS SOLUCIONES.</span>
          <h2>Todo en su lugar.<br />{' '}<em>Desde el primer <br />servicio.</em></h2>
          <p>Un espacio para organizar tus servicios, encontrar cada contacto y dedicar más tiempo a lo que mejor sabes hacer.</p>
          <div className="login-features">
            <div><span className="feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="m8 12 3 3 5-6" /></svg></span><span><strong>Tu trabajo, organizado</strong><small>Servicios y especialidades en un solo lugar.</small></span></div>
            <div><span className="feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3" /><path d="M5 20v-2a7 7 0 0 1 14 0v2M8 20h8" /></svg></span><span><strong>Cada detalle, a mano</strong><small>Contactos, direcciones y horarios de atención.</small></span></div>
          </div>
        </section>
        <section className="login-card" aria-labelledby="login-title">
          <span className="login-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg></span>
          <span className="eyebrow">BIENVENIDO A TU ESPACIO</span>
          <h1 id="login-title">Iniciar sesión</h1>
          <p>Ingresa tus credenciales para continuar<br className="desktop-break" /> con la gestión de tus servicios.</p>
          <form onSubmit={acceder} className="login-form">
            <div><label htmlFor="username">Usuario</label><input className="form-control" id="username" name="username" placeholder="Tu nombre de usuario" autoComplete="username" required maxLength={150} disabled={cargando} /></div>
            <div><label htmlFor="password">Contraseña</label><input className="form-control" id="password" name="password" placeholder="Ingresa tu contraseña" type="password" autoComplete="current-password" required disabled={cargando} /></div>
            {error && <div className="alert alert-danger login-error" role="alert">{error}</div>}
            <button className="btn btn-orange" disabled={cargando}>{cargando ? 'Accediendo…' : 'Acceder'}<span aria-hidden="true">→</span></button>
          </form>
          <p className="login-note">Tu panel estará disponible después de iniciar sesión.</p>
        </section>
      </div>
      <footer className="login-footer"><span>GASFITERÍA · GESTIÓN DE SERVICIOS</span><span>Hecho para trabajar con claridad.</span></footer>
    </div>
  </main>
  return <>
    <a className="visually-hidden-focusable skip-link" href="#contenido">Ir al contenido</a>
    <header className="topbar">
      <a className="identity" href="#" onClick={e => { e.preventDefault(); setVista('listado') }}>
        <span className="brand-mark" aria-hidden="true">G<span>●</span></span>
        <span><strong>David Gonzalez</strong><small>GASFITERÍA · PANEL DE GESTIÓN</small></span>
      </a>
      <nav aria-label="Navegación principal">
        <button className={`nav-item ${vista === 'formulario' ? 'active' : ''}`} aria-current={vista === 'formulario' ? 'page' : undefined} onClick={() => setVista('formulario')}>Formulario</button>
        <button className={`nav-item ${vista === 'listado' ? 'active' : ''}`} aria-current={vista === 'listado' ? 'page' : undefined} onClick={() => setVista('listado')}>Listado</button>
      </nav>
      <div className="account"><span>{usuario}</span><button className="btn btn-outline-light btn-sm" onClick={cerrarSesion}>Salir</button></div>
    </header>
  </>
}
