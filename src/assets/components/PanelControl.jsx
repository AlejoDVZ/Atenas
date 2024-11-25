import { useEffect, useState } from 'react';
import PersonalModule from './Admin/PersonalModule';
import DefensoriasModule from './Admin/DefensoriasModule';
import './PanelControl.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { LogOut, LogOutIcon } from 'lucide-react';

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
    <div className="container-fluid vh-100">
      <header className="row bg-dark text-white py-3">
        <div className="col-md-3">
          <img src='/LOGO-DP-a-610px.png' alt="Logo Defensa Pública de Venezuela" className="img-fluid" style={{ maxHeight: '60px' }} />
        </div>
        <div className="col-md-5">
          <div className="mt-3 d-flex flex-row nav align-content-center justify-content-evenly">
            <button 
              className={`nav-item btn btn-primary ${activeTab === "personal" ? "btn-warning" : ""}`} 
              onClick={() => setActiveTab("personal")}
            >
              Gestión de Personal
            </button>
            <button 
              className={`nav-item btn btn-primary ${activeTab === "defensorias" ? "btn-warning" : ""}`} 
              onClick={() => setActiveTab("defensorias")}
            >
              Gestión de Defensorías
            </button>
          </div>
        </div>
        <div className="col-md-4 d-flex justify-content-end align-items-center">
          <button onClick={handleLogout} className="btn btn-outline-light">
            <LogOut size={20} />
          </button>
        </div>
      </header>
      
      <div className="tab-content">
        {activeTab === "personal" && <PersonalModule />}
        {activeTab === "defensorias" && <DefensoriasModule />}
      </div>
    </div>
  );
}

export default PanelControl;