import  { useEffect, useState } from 'react';
import './UserDashboard.css';
import {Link,NavLink, useNavigate} from "react-router-dom";
 // Asegúrate de tener este archivo en tu proyecto

 
export default function UserDashboard() {

  useEffect(()=>{
    LoadCases();
  },[]
  );

  const LoadCases = async () => {
    try{
        const response = await fetch('http://localhost:3300/user/cases', { 
            method: 'GET',
        });
        const cases = await response.json();
        console.log(cases); 
        setCases(cases);
    } catch (error) {
        console.error('Error:', error);
    }
};

 
  const [cases, setCases] = useState([]
  );
  const [currentUser, setCurrentUser] = useState('Juan Pérez');
  const [SelectedCase,setSelectedCase] = useState(false);
 

  const navigate = useNavigate();
  const handleLogout = () => {
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
          <button onClick={handleLogout}>
              <img className='logout' src={"/logout.svg"} alt="" />
          </button>
        </div>
      </header>
      <div className="dashboard-content">
          <NavLink className="dashboard-aside">
            <Link>
              Dashboard
            </Link>
            <br />
            <Link>
              Inventario
            </Link>
          </NavLink>
        <main className="dashboard-main">
          <h2>Casos Actuales</h2>
          {cases.length < 1 &&
              <div className='noCases'>
                <h1>
                  No hay Casos!
                </h1>
                <p>
                  Agrege un Caso
                </p>
              </div>
            }
          <div className="case-grid">
            {cases.length > 0 && cases.map(caseItem => (
              <div key={caseItem.id} onClick={() => setSelectedCase(caseItem)}>
                <h3>Caso #{caseItem.numberCausa}</h3>
                <p>Fecha de inicio: {caseItem.dateB}</p>
                <p>Fecha de aceptacion: {caseItem.dateA}</p>
              </div>
            ))}
            {SelectedCase && (
               <div className="modal">
               <div className="modal-content">
               <h3>Caso #{SelectedCase.numberCausa}</h3>
                 <button className="close-button" onClick={() => setSelectedCase(null)}>Cerrar</button>
               </div>
             </div>
            )
            }
          </div>
        </main>
      </div>
    </div>
  );
}