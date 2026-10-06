import { useEffect, useRef, useState } from 'react'
import { peticion, textoError } from '../api.js'

export default function FormularioEntidades({ usuario }) {
  const [opciones, setOpciones] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [recarga, setRecarga] = useState(0)
  const formRef = useRef(null)
  useEffect(() => {
    const controller = new AbortController()
    setAviso(null)
    peticion('/gasfiteria/opciones/', { signal: controller.signal })
      .then(setOpciones).catch(err => {
        if (err.name !== 'AbortError') setAviso({ tipo: 'danger', texto: textoError(err) })
      })
    return () => controller.abort()
  }, [recarga])

  async function registrar(event) {
    event.preventDefault()
    if (guardando) return
    const datos = Object.fromEntries(new FormData(event.currentTarget))
    datos.id_servicio = Number(datos.id_servicio)
    setGuardando(true)
    setAviso(null)
    try {
      await peticion('/gasfiteria/', { method: 'POST', body: datos })
      formRef.current.reset()
      setAviso({ tipo: 'success', texto: `Servicio #${datos.id_servicio} registrado correctamente. Puedes ingresar un nuevo servicio.` })
    } catch (err) { setAviso({ tipo: 'danger', texto: textoError(err) }) }
    finally { setGuardando(false) }
  }

  return <>
    <section className="page-heading"><div><span className="eyebrow">NUEVO REGISTRO</span><h1>Un servicio, <em>una solución.</em></h1><p>Agrega los datos del servicio a tu directorio de gasfitería.</p></div><span className="outline-number" aria-hidden="true">01 /</span></section>
    <section className="surface form-surface">
      <div className="section-title"><div><h2>Formulario de registro de servicio</h2><p>Completa los ocho campos. Todos son obligatorios.</p></div><span className="pill">NUEVO SERVICIO</span></div>
      {aviso && <div className={`alert alert-${aviso.tipo}`} role="alert">{aviso.texto}</div>}
      {!usuario && <div className="alert alert-info" role="status">Inicia sesión desde el menú superior para registrar servicios.</div>}
      {!opciones && <div className="load-options"><p>Esperando las opciones del formulario.</p><button className="btn btn-outline-light" onClick={() => setRecarga(recarga + 1)}>Reintentar carga</button></div>}
      <form onSubmit={registrar} ref={formRef}>
        <fieldset disabled={guardando || !usuario || !opciones}>
          <div className="form-grid">
            <div><label htmlFor="id_servicio">ID del servicio <span>01</span></label><input className="form-control" id="id_servicio" name="id_servicio" type="number" min="1" max="999999" step="1" required placeholder="Ej. 104" /></div>
            <div><label htmlFor="servicio">Servicio <span>02</span></label><input className="form-control" id="servicio" name="servicio" maxLength="100" required pattern=".*\S.*" placeholder="Ej. Reparación de filtraciones" /></div>
            <div className="full-width"><label htmlFor="especialista">Especialista <span>03</span></label><select className="form-select" id="especialista" name="especialista" required defaultValue=""><option value="" disabled>Selecciona una especialidad</option>{opciones?.especialistas.map(value => <option key={value}>{value}</option>)}</select></div>
            <div><label htmlFor="reputacion">Reputación <span>04</span></label><input className="form-control" id="reputacion" name="reputacion" type="number" min="0" max="5" step="0.1" required placeholder="De 0 a 5" /></div>
            <div><label htmlFor="correo_contacto">Correo de contacto <span>05</span></label><input className="form-control" id="correo_contacto" name="correo_contacto" type="email" maxLength="100" required placeholder="contacto@ejemplo.cl" /></div>
            <div className="full-width"><label htmlFor="direccion">Dirección <span>06</span></label><select className="form-select" id="direccion" name="direccion" required defaultValue=""><option value="" disabled>Selecciona una dirección de atención</option>{opciones?.direcciones.map(value => <option key={value}>{value}</option>)}</select></div>
            <div><label htmlFor="hora_atencion">Hora de atención <span>07</span></label><input className="form-control" id="hora_atencion" name="hora_atencion" type="time" required /></div>
            <div><label htmlFor="telefono_contacto">Teléfono de contacto <span>08</span></label><input className="form-control" id="telefono_contacto" name="telefono_contacto" type="tel" maxLength="16" required placeholder="+56912345678" /></div>
          </div>
          <div className="form-bottom"><span>Revisa los datos antes de registrar.</span><button className="btn btn-orange" disabled={guardando}>{guardando ? 'Registrando…' : 'Registrar Servicio'} <span aria-hidden="true">↗</span></button></div>
        </fieldset>
      </form>
    </section>
  </>
}
