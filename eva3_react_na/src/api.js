const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
let accessToken = null
let refreshToken = null
let pendingRefresh = null

// Las credenciales JWT solo permanecen en memoria, nunca en almacenamiento del navegador.
export function cerrarSesion() {
  accessToken = null
  refreshToken = null
  window.dispatchEvent(new Event('sesion-cerrada'))
}

export async function iniciarSesion(username, password) {
  const data = await peticion('/api/token/', { method: 'POST', body: { username, password } }, false)
  accessToken = data.access
  refreshToken = data.refresh
}

async function renovarSesion() {
  if (!pendingRefresh) {
    const originalRefresh = refreshToken
    pendingRefresh = peticion('/api/token/refresh/', {
      method: 'POST', body: { refresh: originalRefresh },
    }, false).then(data => {
      if (refreshToken !== originalRefresh) throw new Error('La sesión cambió. Vuelve a intentarlo.')
      accessToken = data.access
    }).finally(() => { pendingRefresh = null })
  }
  return pendingRefresh
}

export function textoError(error) {
  return error.message || 'No se pudo completar la operación.'
}

export async function peticion(path, options = {}, autenticar = true, reintentar = true) {
  const headers = { Accept: 'application/json' }
  if (options.body) headers['Content-Type'] = 'application/json'
  if (autenticar && accessToken) headers.Authorization = `Bearer ${accessToken}`
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal || AbortSignal.timeout(15000),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('No se pudo conectar con la API. Comprueba que el servidor esté iniciado e inténtalo otra vez.')
  }
  if (response.status === 401 && autenticar && refreshToken && reintentar) {
    try { await renovarSesion() } catch {
      cerrarSesion()
      throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
    }
    return peticion(path, options, autenticar, false)
  }
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401 && autenticar) cerrarSesion()
    const labels = { id_servicio: 'ID del servicio', servicio: 'Servicio', especialista: 'Especialista',
      reputacion: 'Reputación', correo_contacto: 'Correo', direccion: 'Dirección',
      hora_atencion: 'Hora de atención', telefono_contacto: 'Teléfono' }
    const mensaje = Object.entries(data).map(([key, value]) => `${key === 'detail' ? '' : `${labels[key] || key}: `}${Array.isArray(value) ? value.join(' ') : value}`).join(' ')
    throw new Error(mensaje || `La operación falló (HTTP ${response.status}).`)
  }
  return data
}
