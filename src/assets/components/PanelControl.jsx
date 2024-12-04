import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { LogOut, Users, Building, Scale, Briefcase, Home } from 'lucide-react';
import PersonalModule from './Admin/PersonalModule';
import DefensoriasModule from './Admin/DefensoriasModule';
import FiscaliasModule from './Admin/FiscaliasModule';
import DetentionCentersModule from './Admin/DetentionCentersModule';
import CalificationsModule from './Admin/CalificationsModule';
import './PanelControl.css';

function PanelControl() {
  const [activeModule, setActiveModule] = useState("personal");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);
    }
  }, [navigate]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    console.log('Usuario cerró sesión');
    navigate("/");
  };

  const renderModule = () => {
    switch (activeModule) {
      case "personal":
        return <PersonalModule />;
      case "defensorias":
        return <DefensoriasModule />;
      case "fiscalias":
        return <FiscaliasModule />;
      case "detentionCenters":
        return <DetentionCentersModule />;
      case "califications":
        return <CalificationsModule />;
      default:
        return <PersonalModule />;
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-2 d-md-block bg-dark sidebar">
          <div className="position-sticky pt-3">
            <div className="mb-4">
              <img src='/LOGO-DP-a-610px.png' alt="Logo Defensa Pública de Venezuela" className="img-fluid" style={{ maxHeight: '60px' }} />
            </div>
            <ul className="nav flex-column">
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-white ${activeModule === "personal" ? "active" : ""}`} 
                  onClick={() => setActiveModule("personal")}
                >
                  <Users className="feather" /> Gestión de Personal
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-white ${activeModule === "defensorias" ? "active" : ""}`} 
                  onClick={() => setActiveModule("defensorias")}
                >
                  <Building className="feather" /> Gestión de Defensorías
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-white ${activeModule === "fiscalias" ? "active" : ""}`} 
                  onClick={() => setActiveModule("fiscalias")}
                >
                  <Scale className="feather" /> Gestión de Fiscalías
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-white ${activeModule === "detentionCenters" ? "active" : ""}`} 
                  onClick={() => setActiveModule("detentionCenters")}
                >
                  <Home className="feather" /> Centros de Reclusión
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-white ${activeModule === "califications" ? "active" : ""}`} 
                  onClick={() => setActiveModule("califications")}
                >
                  <Briefcase className="feather" /> Calificaciones
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2 text-light">Panel de Control</h1>
            <button onClick={handleLogout} className="btn btn-outline-danger">
              <LogOut size={20} /> Cerrar Sesión
            </button>
          </div>
          
          {renderModule()}
        </main>
      </div>
    </div>
  );
}

export default PanelControl;

