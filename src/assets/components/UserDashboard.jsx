import  { useEffect, useState } from 'react';
import './UserDashboard.css';
import {useNavigate} from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import CasesModule from './User/CasesModule'; 
import CasesInventoryModule from './User/CasesInventoryModule';
import FullCalendarComponent from './User/CalendarModule';
import { LogOut } from 'lucide-react';


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
                    console.log(currentUser);
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
    <div className="container-fluid d-flex flex-column">
      <header className="row bg-dark text-white py-3">
        <div className="col-md-3">
          <img src='/LOGO-DP-a-610px.png' alt="Logo Defensa Pública de Venezuela" className="img-fluid" style={{ maxHeight: '60px' }} />
        </div>
        <div className="col-md-9 d-flex justify-content-end align-items-center">
          <p className="me-3 mb-0">{currentUser}</p>
          <button onClick={handleLogout} className="btn btn-outline-light">
            <LogOut size={20} />
          </button>
        </div>
      </header>
      
      <div className="row flex-grow-1">
        <nav className="col-md-2 bg-dark p-0">
          <div className="list-group list-group-flush h-100">
            <button 
              className={`list-group-item list-group-item-action ${activeModule === "dashboard" ? "activo" : ""}`} 
              onClick={() => setActiveModule("dashboard")}
            >
              Gestión de Casos
            </button>
            <button 
              className={`list-group-item list-group-item-action ${activeModule === "inventario" ? "activo" : ""}`} 
              onClick={() => setActiveModule("inventario")}
            >
              Inventario de Causas
            </button>

          </div>
        </nav>
        
        <main className="col-md-10 bg-dark-subbtle p-3">
          {activeModule === "dashboard" && <CasesModule id={userID} def={userDef} />}
          {activeModule === "inventario" && <CasesInventoryModule id={userID} def={userDef} />}
          
        </main>
      </div>
    </div>
  );
}