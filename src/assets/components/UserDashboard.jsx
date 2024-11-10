import  { useState } from 'react';
import './UserDashboard.css';
import DashboardAsideSelec from './DashboardAsideSelec';
import {Link,NavLink, redirect, redirectDocument} from "react-router-dom";
 // Asegúrate de tener este archivo en tu proyecto

export default function UserDashboard() {
  const [currentUser, setCurrentUser] = useState('Juan Pérez');
  const [cases, setCases] = useState([
    { id: '001', acceptanceDate: '2023-05-15', lastUpdate: '2023-06-01', isPrivate: true },
    { id: '002', acceptanceDate: '2023-05-20', lastUpdate: '2023-05-30', isPrivate: false },
    { id: '003', acceptanceDate: '2023-06-01', lastUpdate: '2023-06-05', isPrivate: true },
    // Añade más casos según sea necesario
  ]);

  const handleLogout = () => {
    
    console.log('Usuario cerró sesión');
    return redirect("/Login");
  };

  return (
    <div className="user-dashboard">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src={'/LOGO-DP-a-610px.png'} alt="Logo Defensa Pública de Venezuela" className="logo" />
        </div>
        <div className="user-info">
          <span>{currentUser}</span>
          
          <button onClick={handleLogout}>
            <Link to={'/Login'}>
              <img className='logout' src={"/public/logout.svg"} alt="" />
            </Link> 
          </button>
        
          
        </div>
      </header>
      <div className="dashboard-content">
        <aside className="dashboard-aside">
          <NavLink>
            <Link>
              Dashboard
            </Link>
            <br />
            <Link>
              Inventario
            </Link>
          </NavLink>
        </aside>
        <main className="dashboard-main">
          <h2>Casos Actuales</h2>
          <div className="case-grid">
            {cases.map(caseItem => (
              <div key={caseItem.id} className={`case-card ${caseItem.isPrivate ? 'private' : 'public'}`}>
                <h3>Caso #{caseItem.id}</h3>
                <p>Fecha de aceptación: {caseItem.acceptanceDate}</p>
                <p>Última actualización: {caseItem.lastUpdate}</p>
                <p>Estado: {caseItem.isPrivate ? 'Privado de libertad' : 'En libertad'}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}