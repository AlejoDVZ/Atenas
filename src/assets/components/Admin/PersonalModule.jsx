import { useEffect, useState } from 'react';
import './PersonalModule.css';

const personalMock = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', documento: '12345678', tipoDocumento: 'DNI', rol: 'Abogado', defensoria: 'Defensoría 1', correo: 'juan@example.com', telefono: '123456789' },
  { id: 2, nombre: 'María', apellido: 'González', documento: '87654321', tipoDocumento: 'Pasaporte', rol: 'Asistente', defensoria: 'No asignado', correo: 'maria@example.com', telefono: '987654321' },
];

function PersonalModule() {
  const [personal, setPersonal] = useState([{
    id: '',
    name: '',
    lastname: '',
    typeDocument: '',
    document: '',
    role: '',
    email: '',
    prefix: '',
    number:'',
  }]);
  const [selectedPersonal, setSelectedPersonal] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [phonePrefix, setPhonePrefix] = useState([]);
  const [newPersonal, setNewPersonal] = useState({
    name: '',
    lastname: '',
    typeDocument: '',
    document: '',
    role: '',
    email: '',
    phonePrefix:'',
    phone: ''
  });

  useEffect(() => {
    console.log('fetching data');
    fetchDocumentTypes();
    fetchRoles();
    fecthPhonePrefix();
    fetchPersonal();
  }, []); // Asegúrate de que el efecto se ejecute solo una vez

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    
      const response = await fetch('http://localhost:3300/register/member', { // Cambia la URL a la de tu API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPersonal.name,
          lastname: newPersonal.lastname,
          document: newPersonal.document,
          typeDocument: newPersonal.typeDocument,
          role: newPersonal.role,
          email: newPersonal.email,
          phonePrefix: newPersonal.phonePrefix,
          phone: newPersonal.phone,
        }),
      });
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      setIsFormOpen(false);
      setNewPersonal({ name: '', lastname: '', typeDocument: '', document: '', role: '', defensoria: '', email: '', phone: '' }); // Resetear el formulario
    } catch (error) {
      alert(error)
      console.error('Error al enviar los datos:', error);
    }
  };
  const fetchPersonal = async () =>{
    try {
      const response = await fetch('http://localhost:3300/allmembers', {
        method: 'GET'
      });
      const data = await response.json();
      setPersonal(data);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
   
  
  }
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
  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/roles', {
        method: 'GET'
      });
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };
  const fecthPhonePrefix = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/prefix', {
        method: 'GET'
      });
      const data = await response.json();
      setPhonePrefix(data);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPersonal((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="personal-module">
      <h2 className="module-title">Gestión de Personal</h2>
      <div className="personal-grid">
        {personal.map((persona) => (
          <div key={persona.id} className="personal-card" onClick={() => setSelectedPersonal(persona)}>
            <h3>{persona.name} {persona.lastname}</h3>
            <p>Documento: {persona.typeDocument} {persona.document}</p>
            <p>Rol: {persona.role}</p>
            <p>Email: {persona.email}</p>
            <p>Teléfono: {[persona.prefix,persona.number]}</p>
          </div>
        ))}
      </div>
      <button className="add-button" onClick={() => setIsFormOpen(true)}>+</button>
      {isFormOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Registrar Personal</h3>
            <form onSubmit={handleSubmit}>
              <input id='name' name="name" placeholder="Nombre" required 
                value={newPersonal.name} onChange={handleChange} />
              <input id='lastname' name="lastname" placeholder="Apellido" required 
                value={newPersonal.lastname} onChange={handleChange} />
              <select
                id='typeDocument'
                name='typeDocument'
                value={newPersonal.typeDocument}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un tipo</option>
                {documentTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.type}</option>
                ))}
              </select>
              <input name="document" placeholder="Número de Documento" required 
                value={newPersonal.document} onChange={handleChange} />

              <select
                id='role'
                name='role'
                value={newPersonal.role}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un Rol</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.role}</option>
                ))}
              </select>
              <input name="email" type="email" placeholder="Correo Electrónico" required 
                value={newPersonal.email} onChange={handleChange} />
                <div id="phone">
              <select
              id='phonePrefix'
              name='phonePrefix'
              value={newPersonal.phonePrefix}
              onChange={handleChange}
              required>
              <option value="">Seleccione un prefijo</option>
                {phonePrefix.map((prefix) => (
                  <option key={prefix.id} value={prefix.id}>{prefix.prefix}</option>
                ))}
              </select>
                  <input name="phone" type="phone" placeholder="Teléfono" required 
                  value={newPersonal.phone} onChange={handleChange} />
                </div>
            
              <button type="submit">Guardar</button>
            </form>
            <button className="close-button" onClick={() => setIsFormOpen(false) && handleSubmit}>Cerrar</button>
          </div>
        </div>
      )}
      {selectedPersonal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Editar Personal</h3>
            <form>
              <input defaultValue={selectedPersonal.name} placeholder="Nombre" />
              <input defaultValue={selectedPersonal.lastname} placeholder="Apellido" />
              <div id="document">
              <select
                id='typeDocument'
                name='typeDocument'
                value={selectedPersonal.typeDocument}
                onChange={handleChange}
                required>
                  {documentTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.type}</option>
                ))}
                <option value={selectedPersonal.typeDocument}>Seleccione un tipo</option>
              </select>
              <input defaultValue={selectedPersonal.document} placeholder="documento" />
              </div>
              
              <input defaultValue={selectedPersonal.document} placeholder="Número de Documento" />
              <select
                id='role'
                name='role'
                value={newPersonal.role}
                onChange={handleChange}
                required>
                <option value="">{selectedPersonal.role}</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.role}</option>
                ))}
              </select>
              <input defaultValue={selectedPersonal.email} type="email" placeholder="Correo Electrónico" />
              <input defaultValue={[selectedPersonal.prefix,selectedPersonal.number]} type="tel" placeholder="Teléfono" />
              <button type="submit">Guardar Cambios</button>
            </form>
            <button className="close-button" onClick={() => setSelectedPersonal(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalModule;