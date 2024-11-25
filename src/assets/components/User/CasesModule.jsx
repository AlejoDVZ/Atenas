import React, { useEffect, useState } from 'react';
import { Edit, Plus, Upload } from 'lucide-react';
import './CasesModule.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CasesModule(props) {

  const validateDocument = (document) => {
    const documentRegex = /^\d{7,8}$/; // Debe ser un número de 7 u 8 dígitos
    return documentRegex.test(document);
  };
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const { id, def } = props;
  const [isEditingDefendant, setIsEditingDefendant] = useState(false);
  const [editingDefendant, setEditingDefendant] = useState(null);
  const [cases, setCases] = useState([]);
  const [fiscalias, setFiscalias] = useState([]);
  const [detentionCenters, setDetentionCenters] = useState([]);
  const [SelectedCase, setSelectedCase] = useState(null);
  const [SelectEditedCase, setSelectEditedCase] = useState(null);
  const [defendants, setDefendants] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const [proceedings, setProceedings] = useState([]);
  const [isLoadingProceedings, setIsLoadingProceedings] = useState(false);
  const [proceedingsError, setProceedingsError] = useState(null);
  const [newProceeding, setNewProceeding] = useState({
    reportDate: '',
    activity: '',
    result: ''
  });
  const [isActionFormOpen, setIsActionFormOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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
    }],
  });
  const [statusOptions, setStatusOptions] = useState([]);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    if (def) {
      fetchDocumentTypes();
      fetchEducationLevels();
      fetchFiscalias();
      fetchDetentionCenters();
      fetchStatusOptions();
      LoadCases(def);
    }
  }, [def]);

  useEffect(() => {
    if (SelectedCase) {
      loadProceedings(SelectedCase.id);
      loadDefendants(SelectedCase.id);
    }
  }, [SelectedCase]);

const handleProceedingChange = (e) => {
    const { name, value } = e.target;
    setNewProceeding(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  const fetchStatusOptions = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/status', {
        method: 'GET'
      });
      const data = await response.json();
      setStatusOptions(data);
    } catch (error) {
      console.error('Error fetching status options:', error);
    }
  };

  const handleDownload = async (attachmentPath) => {
    try {
      const response = await fetch(`http://localhost:3300/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attachmentPath: attachmentPath }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = attachmentPath.split('/').pop();
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        throw new Error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error al descargar el archivo');
    }
  };

  const loadDefendants = async (caseId) => {
    try {
      const response = await fetch(`http://localhost:3300/defendants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caso: caseId })
      });
      const data = await response.json();
      setDefendants(data);
    } catch (error) {
      console.error('Error loading defendants:', error);
    }
  };

  const handleDefendantUpdate = async (defendantId, updates) => {
    try {
      const response = await fetch('http://localhost:3300/update-defendant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defendantId, ...updates }),
      });
      if (response.ok) {
        loadDefendants(SelectedCase.id);
      }
    } catch (error) {
      console.error('Error updating defendant:', error);
    }
  };

  const getLibertyStatus = (defendant) => {
    if (defendant.stablisment) {
      return `Detenido en ${defendant.stablisment} desde ${formatDate(defendant.arrestedDate)}`;
    } else if (defendant.captureOrder) {
      return "Libre con orden de captura";
    } else {
      return "Libre";
    }
  };

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

  const LoadCases = async (def) => {
    console.log('esta es la defensoria ', def);
    try {
      const response = await fetch('http://localhost:3300/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ def: def })
      });
      const cases = await response.json();
      if (!response.ok) {
        return console.log(cases);
      }
      setCases(cases);
      console.log(cases);
    } catch (error) {
      console.error('Error:', error);
    }
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
        captureOrder: false,
        gender: '',
        isDetained: false,
        detentionCenter: '',
        detentionDate: ''
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
      const response = await fetch('http://localhost:3300/common/doctype', {
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
      const response = await fetch('http://localhost:3300/common/education', {
        method: 'GET'
      });
      const data = await response.json();
      setEducationLevels(data);
    } catch (error) {
      console.error('Error fetching education levels:', error);
    }
  };

  const handleRemoveDefendant = (index) => {
    const updatedDefendants = newCase.defendants.filter((_, i) => i !== index);
    setNewCase({ ...newCase, defendants: updatedDefendants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {

      for (const defendant of newCase.defendants) {
        if (defendant.typeDocument !== 'indocumentado' && !validateDocument(defendant.document)) {
          alert('El documento debe ser un número con 7 o 8 dígitos.');
          return;
        }
    
      }
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
      LoadCases(def);
    } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error al procesar la solicitud: ' + error.message);
    }
  };

  const handleProceedingSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('activity', newProceeding.activity);
    formData.append('reportDate', newProceeding.reportDate);
    formData.append('result', newProceeding.result);
    formData.append('caseId', SelectedCase.id);
    formData.append('userId', id);
    formData.append('defensoriaId', def);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    try {
      const response = await fetch('http://localhost:3300/report', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        loadProceedings(SelectedCase.id);
        setIsActionFormOpen(false);
        setNewProceeding({
          reportDate: '',
          activity: '',
          result: '',
        });
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadProceedings = async (caseId) => {
    console.log('Loading proceedings for case:', caseId);
    setIsLoadingProceedings(true);
    try {
      const response = await fetch('http://localhost:3300/actuaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: caseId }),
      });
      const data = await response.json();
      console.log(data);
      setProceedings(data);
    } catch (error) {
      console.error('Error loading proceedings:', error);
      setProceedings([]);
      setProceedingsError('Error al cargar las actuaciones. Por favor, intente de nuevo.');
    } finally {
      setIsLoadingProceedings(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStatusChange = async (e) => {
    if (window.confirm('Seguro de cambiar status?, si lo cierra o termina sera definitivo.')) {
      const newStatus = e.target.value;
      setIsChangingStatus(true);

      try {
        const response = await fetch(`http://localhost:3300/update-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus, caso: SelectedCase.id }),
        });

        if (response.ok) {
          const updatedCase = await response.json();
          setSelectedCase(prevCase => ({ ...prevCase, state: updatedCase.state }));
          alert(`El caso ha sido actualizado a: ${updatedCase.state}`);
          LoadCases(def);
        } else {
          throw new Error('Failed to update case status');
        }
      } catch (error) {
        console.error('Error updating case status:', error);
        alert("No se pudo actualizar el estado del caso");
      } finally {
        setIsChangingStatus(false);
        
      }
    }
  };
  const handleDateChange = (date, field) => {
    setNewCase(prev => ({ ...prev, [field]: date }));
  };

  const handleDefendantDateChange = (date, index, field) => {
    const updatedDefendants = newCase.defendants.map((defendant, i) => {
      if (i === index) {
        return { ...defendant, [field]: date };
      }
      return defendant;
    });
    setNewCase(prev => ({ ...prev, defendants: updatedDefendants }));
  };

  const handleProceedingDateChange = (date) => {
    setNewProceeding(prev => ({ ...prev, reportDate: date }));
  };

  return (
    <main className="dashboard-main bg-secondary-subtle h-100 p-3">
      <h2 className='align-self-center text-center'>Casos Actuales</h2>
      <div className="case-grid">
        {cases.length === 0 && !isFormOpen && (
          <div className='no-cases-message'>
            <h1>No hay Casos!</h1>
            <p>Agregue un Caso</p>
          </div>
        )}

        {cases.map(caseItem => (
          <div className='case-card' key={caseItem.id} onClick={() => {
          setSelectedCase(caseItem);
          setSelectEditedCase(caseItem);}} 
          data-bs-toggle="modal" data-bs-target="#caseDetailModal">
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

        {/* Bootstrap Modal */}

        {SelectedCase && (
                <div className="modal fade" id="caseDetailModal" style={{}} tabIndex="-1" aria-labelledby="caseDetailModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl align-self-lg-center">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="caseDetailModalLabel">Detalles del Caso</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                  <div className="">
                    <div className="case-detail-header d-flex flex-row justify-content-between align-items-center">
                      <div className="d-flex flex-row align-items-center">
                        <h2 className="me-2">Estado: </h2>
                        <select  //cambiador de estado del caso
                          className="form-select"
                          value={SelectedCase.status}
                          onChange={handleStatusChange}
                        >
                          {statusOptions.map((status) =>   
                            <option key={status.id} value={status.id}>
                              {status.state}
                            </option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="case-detail-content">
                      <div className="case-info-section grid p-3 justify-content- w-100 ">
                          <div className="info-group g-col-3">
                            <label className='fs-5'>Fecha de inicio</label>
                            <p>{new Date(SelectedCase.dateB).toLocaleDateString()}</p>
                          </div>
                          <div className="info-group g-col-3">
                            <label className='fs-5'>Fecha de aceptación</label>
                            <p>{new Date(SelectedCase.dateA).toLocaleDateString()}</p>
                          </div>                
                          <div className="info-group g-col-3">
                            <label className='fs-5'>Fiscalía</label>
                            <p>Número {SelectedCase.fiscalia || 'N/A'}</p>
                          </div>
                          <div className="info-group g-col-4">
                            <label className='fs-5'>Calificación Jurídica</label>
                            <p>{SelectedCase.calification}</p>
                          </div>                                             
                          <div className="info-group g-col-4">
                            <label className='fs-5'>Nro Expediente Defensa Pública</label>
                            <p>{SelectedCase.numberCausa}</p>
                          </div>
                          <div className="info-group g-col-4">
                            <label className='fs-5'>Nro Expediente Tribunal</label>
                            <p>{SelectedCase.tribunalRecord}</p>
                          </div>
                      </div>
  
                      <div className="defendants-section">
                        <h3 className='border-bottom border-black pb-2 '>Defendidos</h3>
                        <div className="defendants-grid pt-2">
                          {defendants.map((defendant) => {
                            const educationText = educationLevels.find(level => level.id === defendant.education)?.level || 'N/A';
                            return (
                              <div key={defendant.id} className="card d-flex justify-content-center p-3">
                                <h4>{defendant.name} {defendant.lastname}</h4>
                                <p><strong>Documento:</strong> {defendant.typeDocument}-{defendant.document}</p>
                                <p><strong>Fecha de nacimiento:</strong> {formatDate(defendant.birth)}</p>
                                <p><strong>Educación:</strong> {educationText}</p>
                                <p><strong>Estado:</strong> {getLibertyStatus(defendant)}</p>
                                <button className="edit-button btn btn-warning" onClick={() => {
                                  setIsEditingDefendant(true);
                                  setEditingDefendant(defendant);
                                }}>
                                  <Edit size={16} /> Editar Estado
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="proceedings-section">
                        <div className="proceedings-header">
                          <h3>Actuaciones</h3>
                          <button
                            className="add-proceeding-button btn btn-primary"
                            onClick={() => setIsActionFormOpen(true)}
                          >
                            <Plus size={20} />
                            Nueva actuación
                          </button>
                        </div>

                        <div className="proceedings-table">
                          {isLoadingProceedings ? (
                            <p className="loading-message">Cargando actuaciones...</p>
                          ) : proceedingsError ? (
                            <p className="error-message">{proceedingsError}</p>
                          ) : proceedings.length > 0 ? (
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Fecha</th>
                                  <th>Actividad</th>
                                  <th>Descripción</th>
                                  <th>Documento</th>
                                </tr>
                              </thead>
                              <tbody>
                                {proceedings.map((proceeding) => (
                                  <tr key={proceeding.id}>
                                    <td>{new Date(proceeding.dateReport).toLocaleDateString()}</td>
                                    <td>{proceeding.actividad}</td>
                                    <td>{proceeding.resultado}</td>
                                    <td>
                                      {proceeding.attachmentPath ? (
                                        <button
                                          onClick={() => handleDownload(proceeding.attachmentPath)}
                                          className="download-button btn btn-info"
                                        >Descargar documento</button>
                                      ) : (
                                        <span>No hay documento adjunto</span>
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
                  </div>
                  </div>
            </div>
          </div>
          </div>
        )}
            

        {isEditingDefendant && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Editar Estado de {editingDefendant.name} {editingDefendant.lastname}</h5>
                  <button type="button" className="btn-close" onClick={() => setIsEditingDefendant(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const status = formData.get('status');
                    const updates = {
                      captureOrder: status === 'captureOrder',
                      stablisment: status === 'detained' ? formData.get('stablisment') : null,
                      arrestedDate: status === 'detained' ? formData.get('arrestedDate') : null,
                    };
                    handleDefendantUpdate(editingDefendant.id, updates);
                    setIsEditingDefendant(false);
                  }}>
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">Estado</label>
                      <select
                        name="status"
                        className="form-select"
                        defaultValue={editingDefendant.stablisment ? 'detained' : (editingDefendant.captureOrder ? 'captureOrder' : 'free')}
                        onChange={(e) => {
                          const detainedFields = document.querySelectorAll('.detained-field');
                          detainedFields.forEach(field => {
                            field.style.display = e.target.value === 'detained' ? 'block' : 'none';
                          });
                        }}
                      >
                        <option value="free">Libre</option>
                        <option value="captureOrder">Libre con orden de captura</option>
                        <option value="detained">Detenido</option>
                      </select>
                    </div>
                    <div className="mb-3 detained-field" style={{ display: editingDefendant.stablisment ? 'block' : 'none' }}>
                      <label htmlFor="stablisment" className="form-label">Centro de Detención</label>
                      <select name="stablisment" className="form-select">
                        {detentionCenters.map((center) => (
                          <option key={center.id} value={center.id}>{center.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3 detained-field" style={{ display: editingDefendant.stablisment ? 'block' : 'none' }}>
                      <label htmlFor="arrestedDate" className="form-label">Fecha de Detención</label>
                      <input
                        type="date"
                        name="arrestedDate"
                        className="form-control"
                        defaultValue={editingDefendant.arrestedDate}
                      />
                    </div>
                    <div className="modal-footer">
                      <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setIsEditingDefendant(false)}>Cancelar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {isActionFormOpen && (
          
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Nueva Actuación</h5>
                  <button type="button" className="btn-close" onClick={() => setIsActionFormOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleProceedingSubmit}>
                    <div className="mb-3 d-flex flex-column">
                      <label htmlFor="reportDate" className="form-label">Fecha de Reporte:</label>
                      <DatePicker
                        id="reportDate"
                        selected={newProceeding.reportDate}
                        onChange={handleProceedingDateChange}
                        minDate={SelectedCase ? new Date(SelectedCase.dateA) : null}
                        maxDate={new Date()}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3 input-group">
                      <label htmlFor="activity" className="form-label">Actividad:</label>
                      <input
                        type='varchar'
                        id="activity"
                        name="activity"
                        className="form-control"
value={newProceeding.activity}
                        onChange={handleProceedingChange}
                        required
                      />
                    </div>
                    <div className="mb-3 input-group">
                      <label htmlFor="result" className="form-label">Resultado:</label>
                      <input
type='text'
                        id="result"
                        name="result"
                        className="form-control"
                        value={newProceeding.result}
                        onChange={handleProceedingChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="file" className="form-label">Adjuntar Documento:</label>
                      <input
                        type="file"
                        className="form-control"
                        id="file"
                        onChange={handleFileChange}
                        accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                    <div className="modal-footer">
                      <button type="submit" className="btn btn-primary">Registrar Actuación</button>
                      <button type="button" className="btn btn-secondary" onClick={() => {
                        setIsActionFormOpen(false);
                        setNewProceeding({
                          reportDate: null,
                          activity: '',
                          result: ''
                        });
                      }}>Cerrar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
        )}

        {isFormOpen && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Registrar Nuevo Caso</h5>
                  <button type="button" className="btn-close" onClick={() => setIsFormOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="numberCausa" className="form-label">Número de Causa:</label>
                        <input
                          type="text"
                          id="numberCausa"
                          className="form-control"
                          value={newCase.numberCausa}
                          onChange={(e) => setNewCase({ ...newCase, numberCausa: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 d-flex flex-column">
                        <label htmlFor="dateB" className="form-label">Fecha de Inicio:</label>
                        <DatePicker
                          id="dateB"
                          selected={newCase.dateB}
                          onChange={(date) => handleDateChange(date, 'dateB')}
                          maxDate={new Date()}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 d-flex flex-column">
                        <label htmlFor="dateA" className="form-label">Fecha de Aceptación:</label>
                        <DatePicker
                          id="dateA"
                          selected={newCase.dateA}
                          onChange={(date) => handleDateChange(date, 'dateA')}
                          minDate={newCase.dateB}
                          maxDate={new Date()}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="tribunalRecord" className="form-label">Número de Expediente del Tribunal:</label>
                        <input
                          type="text"
                          id="tribunalRecord"
                          className="form-control"
                          value={newCase.tribunalRecord}
                          onChange={(e) => setNewCase({ ...newCase, tribunalRecord: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="calification" className="form-label">Calificación Jurídica:</label>
                      <input
                        type="text"
                        id="calification"
                        className="form-control"
                        value={newCase.calification}
                        onChange={(e) => setNewCase({ ...newCase, calification: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="fiscalia" className="form-label">Fiscalía:</label>
                      <select
                        id="fiscalia"
                        className="form-select"
                        value={newCase.fiscalia}
                        onChange={(e) => setNewCase({ ...newCase, fiscalia: e.target.value })}
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
                      <div key={index} className="card mb-3 p-3">
                        <h5>Defendido {index + 1}</h5>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor={`name-${index}`} className="form-label">Nombre:</label>
                            <input
                              type="text"
                              id={`name-${index}`}
                              className="form-control"
                              value={defendant.name}
                              onChange={(e) => handleDefendantChange(index, 'name', e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor={`lastname-${index}`} className="form-label">Apellido:</label>
                            <input
                              type="text"
                              id={`lastname-${index}`}
                              className="form-control"
                              value={defendant.lastname}
                              onChange={(e) => handleDefendantChange(index, 'lastname', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor={`typeDocument-${index}`} className="form-label">Tipo de Documento:</label>
                            <select
                              id={`typeDocument-${index}`}
                              className="form-select"
                              value={defendant.typeDocument}
                              onChange={(e) => handleDefendantChange(index, 'typeDocument', e.target.value)}
                              required
                            >
                              <option value="">Seleccione un tipo</option>
                              <option value="indocumentado">Indocumentado</option>
                              {documentTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.type}</option>
                              ))}
                            </select>
                          </div>
                          {defendant.typeDocument !== 'indocumentado' && (
                            <div className="col-md-6 mb-3">
                              <label htmlFor={`document-${index}`} className="form-label">Número de Documento:</label>
                              <input
                                type="text"
                                id={`document-${index}`}
                                className="form-control"
                                value={defendant.document}
                                onChange={(e) => handleDefendantChange(index, 'document', e.target.value)}
                                required/>
                            </div>
                          )}
                        </div>
                        <div className="row">
                          <div className="col-md-6 d-flex flex-column">
                            <label htmlFor={`birth-${index}`} className="form-label">Fecha de Nacimiento:</label>
                            <DatePicker
                              id={`birth-${index}`}
                              selected={defendant.birth}
                              onChange={(date) => handleDefendantDateChange(date, index, 'birth')}
                              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                              showYearDropdown
                              scrollableYearDropdown
                              yearDropdownItemNumber={100}
                              className="form-control"
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor={`education-${index}`} className="form-label">Nivel de Educación:</label>
                            <select
                              id={`education-${index}`}
                              className="form-select"
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
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor={`gender-${index}`} className="form-label">Género:</label>
                            <select
                              id={`gender-${index}`}
                              className="form-select"
                              value={defendant.gender}
                              onChange={(e) => handleDefendantChange(index, 'gender', e.target.value)}
                              required
                            >
                              <option value="">Seleccione el género</option>
                              <option value="0">Hombre</option>
                              <option value="1">Mujer</option>
                            </select>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                id={`isDetained-${index}`}
                                className="form-check-input"
                                checked={defendant.isDetained}
                                onChange={(e) => handleDefendantChange(index, 'isDetained', e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor={`isDetained-${index}`}>
                                Está detenido
                              </label>
                            </div>
                          </div>
                        </div>
                        {defendant.isDetained && (
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor={`detentionCenter-${index}`} className="form-label">Centro de detención:</label>
                              <select
                                id={`detentionCenter-${index}`}
                                className="form-select"
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
                            <div className="col-md-6 d-flex flex-column">
                              <label htmlFor={`detentionDate-${index}`} className="form-label">Fecha de detención:</label>
                              <DatePicker
                                id={`detentionDate-${index}`}
                                selected={defendant.detentionDate}
                                onChange={(date) => handleDefendantDateChange(date, index, 'detentionDate')}
                                maxDate={new Date()}
                                minDate={newCase.dateB}
                                className="form-control"
                                required
                              />
                            </div>
                          </div>
                        )}
                        {!defendant.isDetained && (
                          <div className="mb-3">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                id={`captureOrder-${index}`}
                                className="form-check-input"
                                checked={defendant.captureOrder}
                                onChange={(e) => handleDefendantChange(index, 'captureOrder', e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor={`captureOrder-${index}`}>
                                Orden de Captura
                              </label>
                            </div>
                          </div>
                        )}
                        {index > 0 && (
                          <button type="button" onClick={() => handleRemoveDefendant(index)} className="btn btn-danger mt-2">
                            Eliminar defendido
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={handleAddDefendant} className="btn btn-secondary mb-3">
                      <Plus size={20} />
                      Agregar otro defendido
                    </button>
                    <div className="modal-footer">
                      <button type="submit" className="btn btn-primary">Guardar Caso</button>
                      <button type="button" className="btn btn-secondary" onClick={() => {
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
            </div>
          </div>
        )}

        <button className="btn btn-primary position-fixed bottom-0 end-0 m-3" onClick={() => setIsFormOpen(true)}>
          <Plus size={24} />
        </button>
      </div>
    </main>
  )
}