import  { useEffect, useState } from 'react';
import './UserDashboard.css';
import {NavLink, useNavigate} from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
 
export default function UserDashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [currentUser, setCurrentUsername] = useState(null);
  const [SelectedCase,setSelectedCase] = useState(false);
  const [userID, setUserID] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [newCase, setNewCase] = useState({
    numberCausa: '',
    dateB: '',
    dateA: '',
    tribunalRecord: '',
    calification: '',
    status: '',
    defendants: [{ 
      name: '', 
      lastname: '', 
      typeDocument: '', 
      document: '', 
      birth: '', 
      education: '', 
      captureOrder: false 
    }],
  });

  useEffect(()=>{
    const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        } else {
            const decodedToken = jwtDecode(token);
            console.log(decodedToken);
            setCurrentUsername(decodedToken.name);
            setUserID(decodedToken.id)
            LoadCases(userID);
        }
  },[useNavigate,userID]
  );
  useEffect(() => {
    if (userID) {
      fetchDocumentTypes();
      fetchEducationLevels();
      fetchStatusOptions();
    }
  }, [userID]);
  const LoadCases = async () => {
    console.log(userID);
    try{
        const response = await fetch('http://localhost:3300/user/cases', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({id : userID})
        });
        const cases = await response.json();
        setCases(cases);
    } catch (error) {
        console.error('Error:', error);
    }
};
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    console.log('Usuario cerró sesión');
    navigate("/");
  };
  const handleAddDefendant = () => {
    setNewCase({
      ...newCase,
      defendants: [...newCase.defendants, { 
        name: '', 
        lastname: '', 
        typeDocument: '', 
        document: '', 
        birth: '', 
        education: '', 
        captureOrder: false 
      }],
    });
  };
  const handleDefendantChange = (index, field, value) => {
    const updatedDefendants = newCase.defendants.map((defendant, i) => {
      if (i === index) {
        return { ...defendant, [field]: value };
      }
      return defendant;
    });
    setNewCase({ ...newCase, defendants: updatedDefendants });
  };
  const fetchDocumentTypes = async () => {  
    try {
      const response = await fetch('http://localhost:3300/common/doctype',{
        method: 'GET'
      });
      const data = await response.json();
      setDocumentTypes(data);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };
  const fetchEducationLevels = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/education',{
        method : 'GET'}
      );
      const data = await response.json();
      setEducationLevels(data);
    } catch (error) {
      console.error('Error fetching education levels:', error);
    }
  };
  const fetchStatusOptions = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/status',{
        method: 'GET'
      });
      const data = await response.json();
      setStatusOptions(data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };
  const handleSubmit = async (event) => {

    event.preventDefault();
    const existingCaseResponse = await fetch(`http://localhost:3300/cases/${newCase.numberCausa}`);
    const existingCase = await existingCaseResponse.json();

    if (existingCase) {
      await fetch(`http://localhost:3300/case/${newCase.numberCausa}/activate`, { method: 'PUT' });
    }else {
      const response = await fetch('http://localhost:3300/newcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase),
      });
      if (response.ok) {
        const createdCase = await response.json();
        await Promise.all(newCase.defendidos.map(defendido => {
          return fetch('http://localhost:3300/defendidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...defendido, caseId: createdCase.id }), // Asegúrate de que el ID del caso se envíe
          });
        }));
      }else{
        console.log('something go wrong')
      }
    }
    setNewCase({
      numberCausa: '',
      fechaInicio: '',
      fechaAceptacion: '',
      calificacion: '',
      estatus: '',
      defendidos: [{ nombre: '', apellido: '', tipoDocumento: '', numeroDocumento: '', fechaNacimiento: '', nivelEducacion: '', ordenCaptura: false }],
    });
    LoadCases(); 
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
          <div className="dashboard-aside">
            <NavLink className={'module'}>
              Dashboard
            </NavLink>
            <br />
            <NavLink className={'module'}>
              Inventario
            </NavLink>
          </div>
        <main className="dashboard-main">
          <h2>Casos Actuales</h2>
          {isFormOpen && (
            <div className="modal">
              <div className="case-form">
                <h3>Registrar Nuevo Caso</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="numberCausa">Número de Causa:</label>
                    <input
                      type="text"
                      id="numberCausa"
                      value={newCase.numberCausa}
                      onChange={(e) => setNewCase({...newCase, numberCausa: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateB">Fecha de Inicio:</label>
                    <input
                      type="date"
                      id="dateB"
                      value={newCase.dateB}
                      onChange={(e) => setNewCase({...newCase, dateB: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateA">Fecha de Aceptación:</label>
                    <input
                      type="date"
                      id="dateA"
                      value={newCase.dateA}
                      onChange={(e) => setNewCase({...newCase, dateA: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="tribunalRecord">Registro del Tribunal:</label>
                    <input
                      type="text"
                      id="tribunalRecord"
                      value={newCase.tribunalRecord}
                      onChange={(e) => setNewCase({...newCase, tribunalRecord: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="calification">Calificación:</label>
                    <input
                      type="text"
                      id="calification"
                      value={newCase.calification}
                      onChange={(e) => setNewCase({...newCase, calification: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Estatus:</label>
                    <select
                      id="status"
                      value={newCase.status}
                      onChange={(e) => setNewCase({...newCase, status: e.target.value})}
                      required
                    >
                      <option value="">Seleccione un estatus</option>
                      {statusOptions.map((option) => (
                        <option key={option.id} value={option.id}>{option.state}</option>
                      ))}
                    </select>
                  </div>

                  <h4>Defendidos</h4>
                  {newCase.defendants.map((defendant, index) => (
                    <div key={index} className="defendant-form">
                      <h5>Defendido {index + 1}</h5>
                      <div className="form-group">
                        <label htmlFor={`name-${index}`}>Nombre:</label>
                        <input
                          type="text"
                          id={`name-${index}`}
                          value={defendant.name}
                          onChange={(e) => handleDefendantChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`lastname-${index}`}>Apellido:</label>
                        <input
                          type="text"
                          id={`lastname-${index}`}
                          value={defendant.lastname}
                          onChange={(e) => handleDefendantChange(index, 'lastname', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`typeDocument-${index}`}>Tipo de Documento:</label>
                        <select
                          id={`typeDocument-${index}`}
                          value={defendant.typeDocument}
                          onChange={(e) => handleDefendantChange(index, 'typeDocument', e.target.value)}
                          required
                        >
                          <option value="">Seleccione un tipo</option>
                          {documentTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor={`document-${index}`}>Número de Documento:</label>
                        <input
                          type="text"
                          id={`document-${index}`}
                          value={defendant.document}
                          onChange={(e) => handleDefendantChange(index, 'document', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`birth-${index}`}>Fecha de Nacimiento:</label>
                        <input
                          type="date"
                          id={`birth-${index}`}
                          value={defendant.birth}
                          onChange={(e) => handleDefendantChange(index, 'birth', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`education-${index}`}>Nivel de Educación:</label>
                        <select
                          id={`education-${index}`}
                          value={defendant.education}
                          onChange={(e) => handleDefendantChange(index, 'education', e.target.value)}
                          required
                        >
                          <option value="">Seleccione un nivel</option>
                          {educationLevels.map((level) => (
                            <option key={level.id} value={level.id}>{level.level}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor={`captureOrder-${index}`}>
                          <input
                            type="checkbox"
                            id={`captureOrder-${index}`}
                            checked={defendant.captureOrder}
                            onChange={(e) => handleDefendantChange(index, 'captureOrder', e.target.checked)}
                          />
                          Orden de Captura
                        </label>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddDefendant} className="add-defendant-btn">
                    Agregar otro defendido
                  </button>
                  <button type="submit" className="submit-btn">Guardar Caso</button>
                </form>
                <button className="close-button" onClick={() => setIsFormOpen(false)}>Cerrar</button>
              </div>
            </div>
          )}
          
          <div className="case-grid">
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
            {cases.length > 0 && 
              cases.map(caseItem => (
                <div className='case-card' key={caseItem.id} onClick={() => setSelectedCase(caseItem)}>
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
            )}
            <button className="add-button" onClick={() => setIsFormOpen(true)}>+</button>
          </div>
        </main>
      </div>
    </div>
  );
}