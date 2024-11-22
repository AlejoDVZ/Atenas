import { useEffect, useState } from 'react'
import { UploadIcon as FileUpload, Plus } from 'lucide-react';
import './CasesModule.css';



export default function CasesModule(props) {
  
  const id = props.id;
  const def = props.def

    const [cases, setCases] = useState([]);
    const [fiscalias,setFiscalias] = useState([]);
    const [detentionCenters, setDetentionCenters] = useState([])
    const [SelectedCase,setSelectedCase] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [educationLevels, setEducationLevels] = useState([]);
    const [proceedings, setProceedings] = useState([]);
    const [newProceeding, setNewProceeding] = useState({
      realizationDate: '',
      reportDate: '',
      activity: '',
      result: '',
      attachmentPath: ''
    });
    const [isActionFormOpen, setIsActionFormOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
   /* const [statusOptions, setStatusOptions] = useState([]);*/
    const [newCase, setNewCase] = useState({
      numberCausa: '',
    dateB: '',
    dateA: '',
    tribunalRecord: '',
    calification: '',
    fiscalia: '',
    defendants: [{ 
      name: '', 
      lastname: '', 
      typeDocument: '', 
      document: '', 
      birth: '', 
      education: '', 
      captureOrder: false,
      gender: '',
      isDetained: false,
      detentionCenter: '',
      detentionDate: ''
    }],});
    useEffect(() => {
      
        if (def) {
          fetchDocumentTypes();
          fetchEducationLevels();
          fetchFiscalias();
          fetchDetentionCenters();
          LoadCases(def)
          /*fetchStatusOptions();*/
        }
      }, [def]);

    useEffect(() => {
      if (SelectedCase) {
        loadProceedings(SelectedCase.id);
      }
    }, [SelectedCase]);
    
    useEffect(() => {
      if (SelectedCase) {
        loadProceedings(SelectedCase.id);
      }
    }, [SelectedCase]);

  const fetchFiscalias = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/fiscalias', {
        method: 'GET'
      });
      const data = await response.json();
      setFiscalias(data);
    } catch (error) {
      console.error('Error fetching fiscalias:', error);
    }
  };
  
  const fetchDetentionCenters = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/detentioncenters', {
        method: 'GET'
      });
      const data = await response.json();
      setDetentionCenters(data);
    } catch (error) {
      console.error('Error fetching detention centers:', error);
    }
  };

  const LoadCases = async (def) => {  //carga de casos
  console.log('esta es la defensoria ', def);
  try{
      const response = await fetch('http://localhost:3300/cases', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({def : def})
      });
      const cases = await response.json();
      if(!response.ok){
        
        return console.log(cases)
      }
      setCases(cases);
      console.log(cases)
  } catch (error) {
      console.error('Error:', error);
  }
    };

  const handleAddDefendant = () => { // agrega otro form de defendido al registro
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

  const handleDefendantChange = (index, field, value) => {  //maneje al cambio de valores del formulario de defendidos
    const updatedDefendants = newCase.defendants.map((defendant, i) => {
      if (i === index) {
        return { ...defendant, [field]: value };
      }
      return defendant;
    });
    setNewCase({ ...newCase, defendants: updatedDefendants });
  };

  const fetchDocumentTypes = async () => {  //guarda los tipos de documentos
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

  const fetchEducationLevels = async () => { //guarda los niveles de educaion
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

  const handleRemoveDefendant = (index) => { //remueve el formulario de defendido
    const updatedDefendants = newCase.defendants.filter((_, i) => i !== index);
    setNewCase({ ...newCase, defendants: updatedDefendants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const checkResponse = await fetch('http://localhost:3300/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numberCausa: newCase.numberCausa,
          defensoriaId: def
        }),
      });
      
      if (checkResponse.status === 200) {
        alert('Este caso ya existe para esta defensoría.');
        return;
      }
      const response = await fetch('http://localhost:3300/register/newcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCase,
          userId: id,
          defensoriaId: def
        }),
      });
      const createdCase = await response.json();
      console.log(createdCase);

      alert('Nuevo caso creado con éxito.');
      setNewCase({
        numberCausa: '',
        dateB: '',
        dateA: '',
        tribunalRecord: '',
        calification: '',
        fiscalia: '',
        defendants: [{ 
          name: '', 
          lastname: '', 
          typeDocument: '', 
          document: '', 
          birth: '', 
          education: '', 
          captureOrder: false,
          gender: '',
          isDetained: false,
          detentionCenter: '',
          detentionDate: ''
        }],
      });
      setIsFormOpen(false);
      LoadCases(id);
    } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error al procesar la solicitud: ' + error.message);
    }
  };

  const handleFileChange = (event) => { // maneja los cambios de los archivos
    setSelectedFile(event.target.files[0]);
  };

  const handleProceedingSubmit = async (e) => { // manjea el reporte de actuaciones
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('proceedingData', JSON.stringify({
        ...newProceeding,
        caseId: SelectedCase.id
      }));

      const response = await fetch('http://localhost:3300/proceedings/new', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        loadProceedings(SelectedCase.id);
        setIsActionFormOpen(false);
        setNewProceeding({
          realizationDate: '',
          reportDate: '',
          activity: '',
          result: '',
          attachmentPath: ''
        });
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadProceedings = async (caso) => { // carga las actuaciones
    try {
      const response = await fetch(`http://localhost:3300/actuaciones`,{
        method: 'POST',
        body: JSON.stringify({
          id : caso
        })
      });
      const data = await response.json();
      setProceedings(data);
    } catch (error) {
      console.error('Error loading proceedings:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Formato: YYYY-MM-DD

};
  return (
    <main className="dashboard-main">
          <h2>Casos Actuales</h2>
          <div className="case-grid">

            {cases.length === 0 && !isFormOpen && (
              <div className='no-cases-message'>
                <h1>No hay Casos!</h1>
                <p>Agregue un Caso</p>
              </div>
            )}
            
            {cases.map(caseItem => (
            <div className='case-card' key={caseItem.id} onClick={() => setSelectedCase(caseItem)}>
              <h3>Caso #{caseItem.numberCausa}</h3>
              <div className="case-info">
                <p><strong>Inicio:</strong> {formatDate(caseItem.dateB)}</p>
                <p><strong>Aceptación:</strong> {formatDate(caseItem.dateA)}</p>
                <p><strong>Calificación:</strong> {caseItem.calification}</p>
                <p><strong>Asunto:</strong> {caseItem.tribunalRecord}</p>
                <p><strong>Fiscalía:</strong> {caseItem.fiscalia}</p>
              </div>
            </div>
          ))}

            {SelectedCase && (
              <div className="modal">
                <div className="case-detail">
                  <div className="case-detail-header">
                    <div className="case-status">
                      <h2>Estado: <span className="status-active">Activo</span></h2>
                    </div>
                  </div>
            
              <div className="case-detail-content">
                <div className="case-info-section">
                  
                  <div className="info-group">
                    <label>Fecha de inicio</label>
                    <p>{new Date(SelectedCase.dateB).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Fecha de aceptación</label>
                    <p>{new Date(SelectedCase.dateA).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Fiscalía</label>
                    <p>Número {SelectedCase.fiscalia || 'N/A'}</p>
                  </div>

                  <div className="info-group">
                    <label>Calificación Jurídica</label>
                    <p>{SelectedCase.calification}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Nro Expediente Defensa Pública</label>
                    <p>{SelectedCase.numberCausa}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Nro Expediente Tribunal</label>
                    <p>{SelectedCase.tribunalRecord}</p>
                  </div>
                </div>
              
                <div className="proceedings-section">
  <div className="proceedings-header">
    <h3>Actuaciones</h3>
    <button 
      className="add-proceeding-button"
      onClick={() => setIsActionFormOpen(true)}
    >
      <Plus size={20} />
      Nueva actuación
    </button>
  </div>
  
  <div className="proceedings-table">
    {proceedings.length > 0 ? (
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Documento</th>
          </tr>
        </thead>
        <tbody>
          {proceedings.map((proceeding) => (
            <tr key={proceeding.id}>
              <td>{new Date(proceeding.realizationDate).toLocaleDateString()}</td>
              <td>{proceeding.activity}</td>
              <td>
                {proceeding.attachmentPath && (
                  <a 
                    href={`http://localhost:3300/files/${proceeding.attachmentPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="document-link"
                  >
                    Ver documento
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="no-proceedings-message">No hay actuaciones registradas para este caso.</p>
    )}
  </div>
</div>
            </div>
            
            <button className="close-button" onClick={() => setSelectedCase(null)}>
              Cerrar
            </button>
              </div>
            </div>
            )}

            {isActionFormOpen && (
            <div className="modal">
              <div className="proceeding-form">
                <h3>Nueva Actuación</h3>
                <form onSubmit={handleProceedingSubmit}>
                  <div className="form-group">
                    <label htmlFor="realizationDate">Fecha de Realización:</label>
                    <input
                      type="date"
                      id="realizationDate"
                      value={newProceeding.realizationDate}
                      onChange={(e) => setNewProceeding({
                        ...newProceeding,
                        realizationDate: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="reportDate">Fecha de Reporte:</label>
                    <input
                      type="date"
                      id="reportDate"
                      value={newProceeding.reportDate}
                      onChange={(e) => setNewProceeding({
                        ...newProceeding,
                        reportDate: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="activity">Actividad:</label>
                    <textarea
                      id="activity"
                      value={newProceeding.activity}
                      onChange={(e) => setNewProceeding({
                        ...newProceeding,
                        activity: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="result">Resultado:</label>
                    <textarea
                      id="result"
                      value={newProceeding.result}
                      onChange={(e) => setNewProceeding({
                        ...newProceeding,
                        result: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="attachment">
                      <FileUpload size={20} />
                      Adjuntar documento
                    </label>
                    <input
                      type="file"
                      id="attachment"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      Guardar Actuación
                    </button>
                    <button
                      type="button"
                      className="close-button"
                      onClick={() => setIsActionFormOpen(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
              )}

            {isFormOpen && (
          <div className="modal">
            <div className="case-form">
              <h3>Registrar Nuevo Caso</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
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
                </div>
                <div className="form-row">
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
                    <label htmlFor="tribunalRecord">Número de Expediente del Tribunal:</label>
                    <input
                      type="text"
                      id="tribunalRecord"
                      value={newCase.tribunalRecord}
                      onChange={(e) => setNewCase({...newCase, tribunalRecord: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="calification">Calificación Jurídica:</label>
                  <input
                    type="text"
                    id="calification"
                    value={newCase.calification}
                    onChange={(e) => setNewCase({...newCase, calification: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fiscalia">Fiscalía:</label>
                  <select
                    id="fiscalia"
                    value={newCase.fiscalia}
                    onChange={(e) => setNewCase({...newCase, fiscalia: e.target.value})}
                    required
                  >
                    <option value="">Seleccione una fiscalía</option>
                    {fiscalias.map((fiscalia) => (
                      <option key={fiscalia.id} value={fiscalia.id}>{fiscalia.number}</option>
                    ))}
                  </select>
                </div>

                <h4>Defendidos</h4> 
                {newCase.defendants.map((defendant, index) => (
                  <div key={index} className="defendant-form">
                    <h5>Defendido {index + 1}</h5>
                    <div className="form-row">
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
                    </div>
                    <div className="form-row">
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
                    </div>
                    <div className="form-row">
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
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`gender-${index}`}>Género:</label>
                        <select
                          id={`gender-${index}`}
                          value={defendant.gender}
                          onChange={(e) => handleDefendantChange(index, 'gender', e.target.value)}
                          required
                        >
                          <option value="">Seleccione el género</option>
                          <option value="0">Hombre</option>
                          <option value="1">Mujer</option>
                        </select>
                      </div>
                      <div className="form-group checkbox-group">
                        <label htmlFor={`isDetained-${index}`}>
                          <input
                            type="checkbox"
                            id={`isDetained-${index}`}
                            checked={defendant.isDetained}
                            onChange={(e) => handleDefendantChange(index, 'isDetained', e.target.checked)}
                          />
                          Está detenido
                        </label>
                      </div>
                    </div>
                    {defendant.isDetained && (
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor={`detentionCenter-${index}`}>Centro de detención:</label>
                          <select
                            id={`detentionCenter-${index}`}
                            value={defendant.detentionCenter}
                            onChange={(e) => handleDefendantChange(index, 'detentionCenter', e.target.value)}
                            required
                          >
                            <option value="">Seleccione un centro</option>
                            {detentionCenters.map((center) => (
                              <option key={center.id} value={center.id}>{center.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor={`detentionDate-${index}`}>Fecha de detención:</label>
                          <input
                            type="date"
                            id={`detentionDate-${index}`}
                            value={defendant.detentionDate}
                            onChange={(e) => handleDefendantChange(index, 'detentionDate', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}
                    {!defendant.isDetained &&(
                      <div className="form-group checkbox-group">
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
                    )}
                    
                    {index > 0 && (
                      <button type="button" onClick={() => handleRemoveDefendant(index)} className="remove-defendant-btn">
                        Eliminar defendido
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddDefendant} className="add-defendant-btn">
                  <Plus size={20} />
                  Agregar otro defendido
                </button>
                <div className="form-actions">
                  <button type="submit" className="submit-btn">Guardar Caso</button>
                  <button type="button" className="close-button" onClick={() => {
                    setIsFormOpen(false);
                    setNewCase({
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
                  }}>Cerrar</button>
                </div>
              </form>
            </div>
          </div>
            )}

            <button className="add-button" onClick={() => setIsFormOpen(true)}>+</button>
          </div>
        </main>
  )
}
