import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Inicio from './vistas/Inicio'
import Login from './vistas/Login'

function App() {

  return (
    <>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
         <Route path="/login" element={<Login/>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
