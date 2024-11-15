import { useState } from 'react';
import PersonalModule from './Admin/PersonalModule';
import DefensoriasModule from './Admin/DefensoriasModule';
import UsuariosModule from './Admin/UsuariosModule';
import './PanelControl.css';

function PanelControl() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="container">
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
        <button 
          className={`tab ${activeTab === "usuarios" ? "active" : ""}`} 
          onClick={() => setActiveTab("usuarios")}
        >
          Gestión de Usuarios
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "personal" && <PersonalModule />}
        {activeTab === "defensorias" && <DefensoriasModule />}
        {activeTab === "usuarios" && <UsuariosModule />}
      </div>
    </div>
  );
}

export default PanelControl;