import  { useEffect, useState } from 'react';
import './UserDashboard.css';
import {useNavigate} from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import CasesModule from './User/CasesModule'; 
 
export default function UserDashboard() {

  const navigate = useNavigate();
  const [currentUser, setCurrentUsername] = useState(null);
  const [userID, setUserID] = useState(null);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [userDef,setUserDef] = useState(null);
  const [User,setUser] = useState([null])

  useEffect(()=>{ //validacion de usuario
    console.log(localStorage.getItem('token'));
    const token = localStorage.getItem('token');
    jwtDecode.veri
        if (!token) {
            navigate('/');
        } else {
          try{
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000; // Tiempo actual en segundos
                if (decodedToken.exp < currentTime) {
                    // Si el token ha expirado, redirigir a la página de inicio
                    console.log('El token ha expirado');
                    localStorage.removeItem('token'); // Opcional: eliminar el token del localStorage
                    navigate('/');
                } else {
                    // Si el token es válido, establecer el estado
                    setCurrentUsername(decodedToken.name);
                    setUserID(decodedToken.id);
                    console.log(userID);
                    setUserDef(decodedToken.defensoria)
                    console.log(userDef);
                }
          }catch (error) {
            console.error('Error al decodificar el token:', error);
            // En caso de error en la decodificación, redirigir a la página de inicio
            navigate('/');
        }
    }
  },[useNavigate,userID]
  );
  const handleLogout = (e) => { //manejo de logout
    e.preventDefault();
    localStorage.removeItem('token');
    console.log('Usuario cerró sesión');
    navigate("/");
  };
  


  return (
    <div className="user-dashboard">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src={'/LOGO-DP-a-610px.png'} alt="Logo Defensa Pública de Venezuela" className="logo" />
        </div>
        <div className="user-info">
          <span>{currentUser}</span>
          <div className="logout">
            <button onClick={handleLogout}>
            <img className='logout' src={"/logout.svg"} alt="" />
          </button></div>
        </div>
      </header>
      
      <div className="dashboard-content">
      <div className="dashboard-module">
        <button 
          className={`module ${activeModule === "dashboard" ? "active" : ""}`} 
          onClick={() => setActiveModule("personal")}
        >
          Gestión de Personal
        </button>
        <button 
          className={`module ${activeModule === "defensorias" ? "active" : ""}`} 
          onClick={() => setActiveModule("defensorias")}
        >
          Gestión de Defensorías
        </button>
      </div>
        {activeModule === "dashboard" && <CasesModule id={userID} def={userDef} />}
        {activeModule === "defensorias" && <Calendar />}
      </div>
    </div>
  );
}