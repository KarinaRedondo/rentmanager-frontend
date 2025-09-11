import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Inicio from './vistas/Inicio'

function App() {

  return (
    <>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
