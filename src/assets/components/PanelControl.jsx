import { useEffect, useState } from 'react';
import PersonalModule from './Admin/PersonalModule';
import DefensoriasModule from './Admin/DefensoriasModule';
import './PanelControl.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function PanelControl() {
  const [activeTab, setActiveTab] = useState("personal");
  const navigate = useNavigate();
  useEffect(()=>{
    const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        } else {
            const decodedToken = jwtDecode(token);
            console.log(decodedToken);
        }
  },[useNavigate]
  );
  const handleLogout = (e) => { //manejo de logout
    e.preventDefault();
    localStorage.removeItem('token');
    console.log('Usuario cerró sesión');
    navigate("/");
  };

  return (
    <div className="container">
      <div id="logout">
      <button onClick={handleLogout}>
              <img className='logout' src={"/logout.svg"} alt="" />
      </button>
      </div>
      <h1 className="title">Panel de Control</h1>
      <div className="tabs">
        <button 
          className={`tab ${activeTab === "personal" ? "active" : ""}`} 
          onClick={() => setActiveTab("personal")}
        >
          Gestión de Personal
        </button>
        <button 
          className={`tab ${activeTab === "defensorias" ? "active" : ""}`} 
          onClick={() => setActiveTab("defensorias")}
        >
          Gestión de Defensorías
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "personal" && <PersonalModule />}
        {activeTab === "defensorias" && <DefensoriasModule />}
      </div>
    </div>
  );
}

export default PanelControl;