import { useEffect, useState } from 'react';
import './PersonalModule.css';

function PersonalModule() {
  const [personal, setPersonal] = useState([{}]);
  const [editedPersonal, setEditedPersonal] = useState(null);
  const [selectedPersonal, setSelectedPersonal] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [defensorias, setDefensorias] = useState([]);
  const [newPersonal, setNewPersonal] = useState({
    id: '',
    name: '',
    lastname: '',
    typeDocument: '',
    document: '',
    role: '',
    email: '',
    number:'',
    password: '',
    defensoria:''
  });

  useEffect(() => {
    console.log('fetching data');
    fetchDocumentTypes();
    fetchRoles();
    fetchPersonal();
    fetchDefensorias();
    
  }, []); // Asegúrate de que el efecto se ejecute solo una vez

  const handleSubmit = async (e) => {
    if(newPersonal.password.length < 8){
      return alert('Porfavor coloque una contraseña de 8 caracteres o mas')
    }
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
          password: newPersonal.password,
          number: newPersonal.number,
          defensoria: newPersonal.defensoria
        }),
      });
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      setIsFormOpen(false);
      setNewPersonal({ name: '', lastname: '', typeDocument: '', document: '', role: '', defensoria: '', email: '', number: '', password:'' }); // Resetear el formulario
      fetchPersonal();
    } catch (error) {
      alert(error)
      console.error('Error al enviar los datos:', error);
    }
  };
  const fetchDefensorias = async () =>{
    try {
      const response = await fetch('http://localhost:3300/common/defensorias', {
        method: 'GET'
      });
      const data = await response.json();
      setDefensorias(data);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
   
  
  }
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
      console.log(data);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPersonal((prev) => ({ ...prev, [name]: value }));
  };
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres borrar este personal?')) {
      try {
        const response = await fetch('http://localhost:3300/delete/personal', { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id : id
          }),
        });
        if (response.ok) {
          alert('Personal borrado')
          fetchPersonal();
          setSelectedPersonal(null);
        } else {
          throw new Error('Error al borrar el personal');
        }
      } catch (error) {
        console.error('Error al borrar el personal:', error);
        alert('Hubo un error al borrar el personal. Por favor, inténtalo de nuevo.');
      }
    }
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedPersonal(prev => {
      if (name === 'role') {
        const selectedRole = roles.find(role => role.role === value);
        return { ...prev, [name]: selectedRole ? selectedRole.role : value };
      }
      return { ...prev, [name]: value };
    });
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const roleId = roles.find(r => r.role === editedPersonal.role)?.id;
      if (!roleId) {
        throw new Error('Invalid role selected');
      }

      const updatedPersonal = {
        ...editedPersonal,
        role: roleId
      };
    try {
      const response = await fetch(`http://localhost:3300/update/personal/${editedPersonal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPersonal),
      });
      if (response.ok) {
        alert('Personal actualizado exitosamente');
        fetchPersonal();
        setSelectedPersonal(null);
        setEditedPersonal(null);
      } else {
        throw new Error('Error al actualizar el personal');
      }
    } catch (error) {
      console.error('Error al actualizar el personal:', error);
      alert('Hubo un error al actualizar el personal. Por favor, inténtalo de nuevo.');
    }
  };


  return (
    <div className="personal-module">
      <h2 className="module-title">Gestión de Personal</h2>
      <div className="personal-grid">
      {personal.map((persona) => {
          // Busca el tipo de documento correspondiente
          const tipoDocumento = documentTypes.find(tipo => tipo.id === persona.typeDocument);
          return (
            <div key={persona.id} className="personal-card" onClick={() => { 
              setSelectedPersonal(persona); 
              setEditedPersonal(persona); 
            }}>
              <h3>{persona.name} {persona.lastname}</h3>
              <p>Documento: {tipoDocumento ? tipoDocumento.type : 'Desconocido'} {persona.document}</p>
              <p>Defensoria: {persona.defensoria}</p>
              <p>Rol: {persona.role}</p>
              <p>Email: {persona.email}</p>
              <p>Teléfono: {persona.number}</p>
            </div>
          );
          })}
      </div>
      <button className="add-button" onClick={() => setIsFormOpen(true)}>+</button>
      {isFormOpen && (
        <div className="modal">
          <div className="modal-content" id='registro-modal'>
            <h3>Registrar Personal</h3>
            <form onSubmit={handleSubmit}>
              <input id='name' name="name" placeholder="Nombre" required  //nombre
                value={newPersonal.name} onChange={handleChange} />
              <input id='lastname' name="lastname" placeholder="Apellido" required  //apellido
                value={newPersonal.lastname} onChange={handleChange} />
              <select  //selector de documento
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
              <select  //selector de rol
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
              <input name="email" type="email" placeholder="Correo Electrónico" required   //email
                value={newPersonal.email} onChange={handleChange} />
              <input name="password" type="password" placeholder="Contraseña" required   //password
              value={newPersonal.password} onChange={handleChange} />
              <input name="number" type="phone" placeholder="Teléfono" required   //phone
              value={newPersonal.number} onChange={handleChange} />
              <select                                                         //selector de rol
                id='defensoria'
                name='defensoria'
                value={newPersonal.defensoria}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una Defensoria</option>
                {defensorias.map((defensoria) => (
                  <option key={defensoria.id} value={defensoria.id}>{defensoria.office}</option> //role
                ))}
              </select>
              <button type="submit" onClick={handleSubmit}>Guardar</button>   
            </form>
            <button id="close-button" onClick={() => setIsFormOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
      {selectedPersonal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Editar Personal</h3>
            <form onSubmit={handleEditSubmit}>
              <input name="name" value={editedPersonal.name} onChange={handleEditChange} placeholder="Nombre" />
              <input name="lastname" value={editedPersonal.lastname} onChange={handleEditChange} placeholder="Apellido" />
              <div id="document">
                <select
                  name="typeDocument"
                  value={editedPersonal.typeDocument}
                  onChange={handleEditChange}
                  required>
                  {documentTypes.map((type) => (
                    <option key={type.id} value={type.id} onChange={handleEditChange}>{type.type}</option>
                  ))}
                </select>
                <input name="document" value={editedPersonal.document} onChange={handleEditChange} placeholder="Documento" /> 
              </div>
              <select                                                         //selector de rol
                id='defensoria'
                name='defensoria'
                value={editedPersonal.defensoria}
                onChange={handleEditChange}
                required>
                <option value="">Seleccione una Defensoria</option>
                {defensorias.map((defensoria) => (
                  <option key={defensoria.id} value={defensoria.id}>{defensoria.office}</option> //role
                ))}
              </select>
              <select
                  name="role"
                  value={editedPersonal.role}
                  onChange={handleEditChange}
                  required>
                  {roles.map((role) => (
                    <option key={role.id} value={role.role} onChange={handleEditChange}>{role.role}</option> ///role
                  ))}
              </select>
              <input name="email" type="email" value={editedPersonal.email} onChange={handleEditChange} placeholder="Correo Electrónico" />
              <input name="number" type="tel" value={editedPersonal.number} onChange={handleEditChange} placeholder="Teléfono" />
              <div className="card-actions">
                <button type="submit" className="edit-button">Guardar Cambios</button>
                <button type="button" id="delete-button" onClick={() => handleDelete(selectedPersonal.id)}>Borrar</button>
              </div>
            </form>
            <button className="close-button" onClick={() => {
              setSelectedPersonal(null);
              setEditedPersonal(null);
            }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalModule;