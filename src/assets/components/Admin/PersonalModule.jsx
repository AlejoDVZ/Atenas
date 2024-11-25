import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import { Plus, Edit, Trash2 } from 'lucide-react';
import './PersonalModule.css';

function PersonalModule() {
    const cedulaRegex = /^\d{7,8}$/;
    const telefonoRegex = /^\d{11}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com\.ve|com|net|org)$/;

  const [personal, setPersonal] = useState([]);
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
    number: '',
    password: '',
    defensoria: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDefensoria, setSelectedDefensoria] = useState('');

  useEffect(() => {
    console.log('fetching data');
    fetchDocumentTypes();
    fetchRoles();
    fetchPersonal();
    fetchDefensorias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Función de validación
    const validateFields = () => {
        if (!cedulaRegex.test(newPersonal.document)) {
            return 'La cédula debe tener entre 7 y 8 dígitos.';
        }
        if (!telefonoRegex.test(newPersonal.number)) {
            return 'El teléfono debe tener 11 dígitos.';
        }
        if (!emailRegex.test(newPersonal.email)) {
            return 'El email no es válido. Debe incluir "@" y terminar en ".com.ve", ".com", ".net" o ".org."';
        }
        if (newPersonal.password.length < 8) {
            return 'Por favor coloque una contraseña de 8 caracteres o más.';
        }
        return null; // Sin errores
    };

    // Validar campos
    const validationError = validateFields();
    if (validationError) {
        return Swal.fire({ icon: 'error', title: 'Error', text: validationError });
    }

    try {
        const response = await fetch('http://localhost:3300/register/member', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPersonal),
        });
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        setIsFormOpen(false);
        setNewPersonal({ name: '', lastname: '', typeDocument: '', document: '', role: '', defensoria: '', email: '', number: '', password: '' });
        fetchPersonal();
    } catch (error) {
        alert(error);
        console.error('Error al enviar los datos:', error);
    }
};

  const fetchDefensorias = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/defensorias', {
        method: 'GET'
      });
      const data = await response.json();
      setDefensorias(data);
    } catch (error) {
      console.error('Error fetching defensorias:', error);
    }
  };

  const fetchPersonal = async () => {
    try {
      const response = await fetch('http://localhost:3300/allmembers', {
        method: 'GET'
      });
      const data = await response.json();
      setPersonal(data);
    } catch (error) {
      console.error('Error fetching personal:', error);
    }
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

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/roles', {
        method: 'GET'
      });
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
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
          body: JSON.stringify({ id }),
        });
        if (response.ok) {
          alert('Personal borrado');
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

    const validateFields = () => {
      if (!cedulaRegex.test(editedPersonal.document)) {
          return 'La cédula debe tener entre 7 y 8 dígitos.';
      }
      if (!telefonoRegex.test(editedPersonal.number)) {
          return 'El teléfono debe tener 11 dígitos.';
      }
      if (!emailRegex.test(editedPersonal.email)) {
          return 'El email no es válido. Debe incluir "@" y terminar en ".com.ve", ".com", ".net" o ".org."';
      }
      return null; // Sin errores
  };

  // Validar campos
  const validationError = validateFields();
  if (validationError) {
      return Swal.fire({ icon: 'error', title: 'Error', text: validationError });
  }

    if (!roleId) {
      throw new Error('Invalid role selected');
    }
    const updatedPersonal = {
      ...editedPersonal,
      role: roleId,
      defensoria: Number(editedPersonal.defensoria) // Convertir a número
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
  const filteredPersonal = personal.filter((persona) => {
    const matchesSearchTerm = `${persona.name} ${persona.lastname}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDefensoria = selectedDefensoria ? String(persona.defensoria) === String(selectedDefensoria) : true;
    return matchesSearchTerm && matchesDefensoria;});

  return (
    <div className="container-fluid">
      <div className="d-flex flex-row row">
      <h2 className="mb-4 text-center align-self-center text-light">Gestión de Personal</h2>
      <div className="search-filter mb-3">
        <input
          className='mx-1 col-3'
          type="text"
          placeholder="Buscar por nombre o apellido"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}/>
        <select
          className='mx-1'
          value={selectedDefensoria}
          onChange={(e) => setSelectedDefensoria(e.target.value,console.log(selectedDefensoria))} >
          <option value="">Seleccionar Defensoria</option>
          {defensorias.map((defensoria) => (
            <option key={defensoria.id} value={defensoria.id}>{defensoria.office}</option>
          ))}
        </select>
      </div>
      </div>
      <div className="row row-cols-3 g-3">
        {filteredPersonal.map((persona) => {
          const tipoDocumento = documentTypes.find(doc => doc.id === persona.typeDocument);
          const oficina = defensorias.find(def => def.id === persona.defensoria);
            return (
            <div key={persona.id} className="card-wrapper">
              <div key={persona.id} className="card personal col" onClick={() => {
                setSelectedPersonal(persona);
                setEditedPersonal(persona);
              }}>
                <div className="card-body">
                  <h5 className="card-title border-bottom border-primary pb-1 ">{persona.name} {persona.lastname}</h5>
                  <p className="card-text">Documento: {tipoDocumento ? tipoDocumento.type : 'Desconocido'} {persona.document}</p>
                  <p className="card-text">Defensoria: {oficina ? oficina.number : 'Desconocido'}</p>
                  <p className="card-text">Rol: {persona.role}</p>
                  <p className="card-text">Email: {persona.email}</p>
                  <p className="card-text">Teléfono: {persona.number}</p>
                </div>
              </div>
            </div>
            );
          })}
      </div>

      <button className="btn btn-primary position-fixed bottom-0 end-0 m-3" onClick={() => setIsFormOpen(true)}>
        <Plus size={24} />
      </button>

      {/* Modal para agregar nuevo personal */}
      <div className={`modal fade ${isFormOpen ? 'show' : ''}`} style={{display: isFormOpen ? 'block' : 'none'}} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Registrar Personal</h5>
              <button type="button" className="btn-close" onClick={() => setIsFormOpen(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input id='name' name="name" className="form-control" placeholder="Nombre" required value={newPersonal.name} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <input id='lastname' name="lastname" className="form-control" placeholder="Apellido" required value={newPersonal.lastname} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <select id='typeDocument' name='typeDocument' className="form-select" value={newPersonal.typeDocument} onChange={handleChange} required>
                    <option value="">Seleccione un tipo</option>
                    {documentTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.type}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <input name="document" className="form-control" placeholder="Número de Documento" required value={newPersonal.document} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <select id='role' name='role' className="form-select" value={newPersonal.role} onChange={handleChange} required>
                    <option value="">Seleccione un Rol</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.role}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <input name="email" type="email" className="form-control" placeholder="Correo Electrónico" required value={newPersonal.email} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <input name="password" type="password" className="form-control" placeholder="Contraseña" required value={newPersonal.password} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <input name="number" type="tel" className="form-control" placeholder="Teléfono" required value={newPersonal.number} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <select id='defensoria' name='defensoria' className="form-select" value={newPersonal.defensoria} onChange={handleChange} required>
                    <option value="">Seleccione una Defensoria</option>
                    {defensorias.map((defensoria) => (
                      <option key={defensoria.id} value={defensoria.id}>{defensoria.office}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar personal */}
      <div className={`modal fade ${selectedPersonal ? 'show' : ''}`} style={{display: selectedPersonal ? 'block' : 'none'}} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar Personal</h5>
              <button type="button" className="btn-close" onClick={() => {
                setSelectedPersonal(null);
                setEditedPersonal(null);
              }}></button>
            </div>
            <div className="modal-body">
              {editedPersonal && (
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-3">
                    <input name="name" className="form-control" value={editedPersonal.name} onChange={handleEditChange} placeholder="Nombre" />
                  </div>
                  <div className="mb-3">
                    <input name="lastname" className="form-control" value={editedPersonal.lastname} onChange={handleEditChange} placeholder="Apellido" />
                  </div>
                  <div className="mb-3">
                    <select name="typeDocument" className="form-select" value={editedPersonal.typeDocument} onChange={handleEditChange} required>
                      {documentTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <input name="document" className="form-control" value={editedPersonal.document} onChange={handleEditChange} placeholder="Documento" />
                  </div>
                  <div className="mb-3">
                    <select name="defensoria" className="form-select" value={editedPersonal.defensoria} onChange={handleEditChange} required>
                      <option value="">Seleccione una Defensoria</option>
                      {defensorias.map((defensoria) => (
                        <option key={defensoria.id} value={defensoria.id}>{defensoria.office}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <select name="role" className="form-select" value={editedPersonal.role} onChange={handleEditChange} required>
                      {roles.map((role) => (
                        <option key={role.id} value={role.role}>{role.role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <input name="email" type="email" className="form-control" value={editedPersonal.email} onChange={handleEditChange} placeholder="Correo Electrónico" />
                  </div>
                  <div className="mb-3">
                    <input name="number" type="tel" className="form-control" value={editedPersonal.number} onChange={handleEditChange} placeholder="Teléfono" />
                  </div>
                  <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(selectedPersonal.id)}>
                      <Trash2 size={16} className="me-2" />
                      Borrar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalModule;