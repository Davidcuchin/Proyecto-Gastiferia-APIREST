import { useEffect, useRef, useState } from 'react'
import { peticion, textoError } from '../api.js'

export default function ListarEntidades({ usuario, setVista }) {
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [aviso, setAviso] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [recarga, setRecarga] = useState(0)
  const [cargado, setCargado] = useState(false)
  const [pendiente, setPendiente] = useState(null)
  const dialogRef = useRef(null)
  useEffect(() => {
    if (pendiente) dialogRef.current.showModal()
    else dialogRef.current.close()
  }, [pendiente])
  useEffect(() => {
    const controller = new AbortController()
    setCargando(true)
    setCargado(false)
    peticion('/gasfiteria/', { signal: controller.signal })
      .then(datos => { setServicios(datos); setCargado(true) })
      .catch(err => { if (err.name !== 'AbortError') setAviso({ tipo: 'danger', texto: textoError(err) }) })
      .finally(() => { if (!controller.signal.aborted) setCargando(false) })
    return () => controller.abort()
  }, [recarga])

  async function eliminar(servicio) {
    if (eliminando !== null) return
    setEliminando(servicio.id_servicio)
    setAviso(null)
    try {
      await peticion(`/gasfiteria/${servicio.id_servicio}/`, { method: 'DELETE' })
      setServicios(actuales => actuales.filter(item => item.id_servicio !== servicio.id_servicio))
      setAviso({ tipo: 'success', texto: `Servicio #${servicio.id_servicio} eliminado correctamente.` })
      setRecarga(actual => actual + 1)
    } catch (err) { setAviso({ tipo: 'danger', texto: textoError(err) }) }
    finally { setEliminando(null); setPendiente(null) }
  }

  const promedio = servicios.length ? (servicios.reduce((sum, servicio) => sum + Number(servicio.reputacion), 0) / servicios.length).toFixed(1) : '—'
  return <>
    <section className="page-heading"><div><span className="eyebrow">DIRECTORIO DE SERVICIOS</span><h1>Todo en orden.<br /><em>Cada servicio, a la vista.</em></h1><p>Consulta y administra tus servicios de gasfitería en un solo lugar.</p></div><button className="btn btn-orange" onClick={() => setVista('formulario')}><span aria-hidden="true">＋</span> Registrar servicio</button></section>
    <div className="stats-grid">
      <section className="stat"><span>SERVICIOS REGISTRADOS</span><strong>{cargado ? String(servicios.length).padStart(2, '0') : '—'}</strong><small>En tu directorio</small></section>
      <section className="stat"><span>ESPECIALIDADES</span><strong>{cargado ? String(new Set(servicios.map(s => s.especialista)).size).padStart(2, '0') : '—'}</strong><small>Áreas de atención</small></section>
      <section className="stat"><span>REPUTACIÓN PROMEDIO</span><strong>{cargado ? promedio : '—'} <i aria-hidden="true">★</i></strong><small>Sobre 5 puntos</small></section>
    </div>
    <section className="surface list-surface">
      <div className="section-title"><div><h2>Listado de servicios <span className="count-badge">{cargado ? servicios.length : '—'}</span></h2><p>Información de contacto y atención de cada servicio.</p></div><button className="btn btn-outline-light btn-sm" disabled={cargando || eliminando !== null} onClick={() => { setAviso(null); setRecarga(actual => actual + 1) }}>↻ Actualizar listado</button></div>
      {aviso && <div className={`alert alert-${aviso.tipo}`} role="alert">{aviso.texto}</div>}
      {!usuario && <div className="read-only-note">Modo consulta <span>·</span> Inicia sesión para registrar o eliminar servicios.</div>}
      <div className="table-responsive" aria-busy={cargando}>
        <table className="table service-table align-middle"><caption className="visually-hidden">Servicios de gasfitería con sus ocho datos y opción para eliminar.</caption><thead><tr>{['ID servicio', 'Servicio', 'Especialista', 'Reputación', 'Correo de contacto', 'Dirección', 'Hora atención', 'Teléfono contacto', 'Eliminar'].map(titulo => <th scope="col" key={titulo}>{titulo}</th>)}</tr></thead>
          <tbody>{cargando ? <tr><td colSpan="9" className="empty-state">Cargando servicios…</td></tr> : !cargado ? <tr><td colSpan="9" className="empty-state">No se pudo cargar el directorio. Pulsa «Actualizar listado» para reintentar.</td></tr> : servicios.length === 0 ? <tr><td colSpan="9" className="empty-state"><strong>Tu próximo servicio empieza aquí.</strong><p>Aún no hay servicios registrados.</p><button className="btn btn-orange btn-sm" onClick={() => setVista('formulario')}>Registrar el primer servicio</button></td></tr> : servicios.map(servicio => <tr key={servicio.id_servicio}>
            <td className="id-cell">#{servicio.id_servicio}</td><td className="service-name">{servicio.servicio}</td><td>{servicio.especialista}</td><td><span className="rating"><span aria-hidden="true">★</span> {servicio.reputacion}</span></td><td><a href={`mailto:${servicio.correo_contacto}`}>{servicio.correo_contacto}</a></td><td>{servicio.direccion}</td><td className="time-cell">{servicio.hora_atencion.slice(0, 5)}</td><td><a href={`tel:${servicio.telefono_contacto}`}>{servicio.telefono_contacto}</a></td><td><button className="delete-button" aria-label={`Eliminar servicio ${servicio.id_servicio}`} title={usuario ? 'Eliminar servicio' : 'Inicia sesión para eliminar'} disabled={!usuario || eliminando !== null} onClick={() => setPendiente(servicio)}><svg width="17" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" /></svg></button></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="table-footer"><span>{cargado ? `${servicios.length} servicio${servicios.length === 1 ? '' : 's'} en total` : 'Directorio de servicios'}</span><span>Datos de atención y contacto</span></div>
    </section>
    <dialog ref={dialogRef} className="confirm-dialog" aria-labelledby="confirm-title" aria-describedby="confirm-description" onClose={() => setPendiente(null)} onCancel={event => { if (eliminando !== null) event.preventDefault() }}>
      <span className="eyebrow">CONFIRMAR ACCIÓN</span>
      <h2 id="confirm-title">¿Eliminar este servicio?</h2>
      <p id="confirm-description">#{pendiente?.id_servicio} · {pendiente?.servicio}<br />Esta acción no se puede deshacer.</p>
      <div className="dialog-actions"><button className="btn btn-outline-light" autoFocus disabled={eliminando !== null} onClick={() => setPendiente(null)}>Cancelar</button><button className="btn btn-orange" disabled={eliminando !== null || !usuario} onClick={() => eliminar(pendiente)}>{eliminando !== null ? 'Eliminando…' : 'Confirmar eliminación'}</button></div>
    </dialog>
  </>
}
