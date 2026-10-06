import { useEffect, useState } from 'react'
import Menu from './components/Menu.jsx'
import ListarEntidades from './components/ListarEntidades.jsx'
import FormularioEntidades from './components/FormularioEntidades.jsx'

export default function App() {
  const [vista, setVista] = useState('listado')
  const [usuario, setUsuario] = useState('')
  useEffect(() => {
    const salir = () => { setUsuario(''); setVista('listado') }
    window.addEventListener('sesion-cerrada', salir)
    return () => window.removeEventListener('sesion-cerrada', salir)
  }, [])
  const menu = <Menu vista={vista} setVista={setVista} usuario={usuario} setUsuario={setUsuario} />
  if (!usuario) return menu
  return <>
    {menu}
    <main className="container-fluid page-shell" id="contenido">
      <div className="breadcrumb-line">GASFITERÍA <span>/</span> GESTIÓN DE SERVICIOS</div>
      {vista === 'listado'
        ? <ListarEntidades usuario={usuario} setVista={setVista} />
        : <FormularioEntidades usuario={usuario} />}
    </main>
    <footer className="page-footer"><span>GASFITERÍA <b>●</b> Gestión de servicios</span><span>David Gonzalez · Evaluación 3</span></footer>
  </>
}
