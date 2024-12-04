import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import { Plus, Edit, Trash2, RectangleEllipsis } from 'lucide-react';
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
const [selectedRole, setSelectedRole] = useState('');
const [Docsearch, setDocSearc] = useState('');
const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

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

      // Manejar la respuesta
      if (!response.ok) {
          const errorData = await response.json(); // Leer el cuerpo de la respuesta
          throw new Error(errorData.message || 'Error en la solicitud'); // Usar el mensaje del servidor
      }
      Swal.fire({icon:'success',title:'Personal registrado'})
      setIsFormOpen(false);
      setNewPersonal({ name: '', lastname: '', typeDocument: '', document: '', role: '', defensoria: '', email: '', number: '', password: '' });
      fetchPersonal();
  } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message }); // Mostrar el mensaje de error específico
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
  Swal.fire({
    title: "Seguro de Eliminar a este personal?",
    text: "No puedes desahcerlo!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si!"
  }).then(async (result) => { // Aquí se añade async
    if (result.isConfirmed) {
      try {
        const response = await fetch('http://localhost:3300/disable/personal', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });
        if (response.ok) {
          Swal.fire({
            icon: 'success', // Cambié 'warning' por 'success' para indicar que la acción fue exitosa
            title: 'Personal eliminado',
            text: 'El personal ha sido eliminado con éxito.'
          });
          fetchPersonal();
          setSelectedPersonal(null);
        } else {
          throw new Error('Error al borrar el personal');
        }
      } catch (error) {
        console.error('Error al borrar el personal:', error);
        Swal.fire({
          icon: 'error',
          title: 'Ha ocurrido un error',
          text: 'Error al borrar el personal, por favor intente de nuevo',
        });
      }
    }
  });
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
      Swal.fire({
        title : 'Personal actualizado',
        icon : 'success',
        timer : 2000
      })
      fetchPersonal();
      setSelectedPersonal(null);
      setEditedPersonal(null);
    } else {
      const errorData = await response.json(); // Leer el cuerpo de la respuesta
      throw new Error(errorData.message || 'Error en la solicitud'); // Usar el mensaje del servidor
  }
  } catch (error) {
    console.error('Error al actualizar el personal:', error);
    return Swal.fire({ icon: 'error', title: 'Error', text: error})
  }
};

const handleChangePassword = async () => {
  // Verificar si los campos están vacíos
  if (!newPassword || newPassword.trim().length === 0) {
    return Swal.fire({
      title: 'Campo vacío',
      text: 'Por favor ingrese una nueva contraseña.',
      icon: 'error',
    });
  }
  
  if (!confirmPassword || confirmPassword.trim().length === 0) {
    return Swal.fire({
      title: 'Confirmar contraseña',
      text: 'Por favor confirme la contraseña.',
      icon: 'error',
    });
  }

  // Verificar la longitud de la nueva contraseña
  if (newPassword.length < 8) {
    return Swal.fire({
      title: 'Un poco más!',
      text: 'Por favor coloque una contraseña de 8 caracteres o más.',
      icon: 'error',
    });
  }

  // Verificar si las contraseñas coinciden
  if (newPassword !== confirmPassword) {
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Las contraseñas no coinciden.',
    });
  }

  // Aquí va el código para hacer la solicitud de cambio de contraseña
  try {
    const response = await fetch(`http://localhost:3300/update/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword, id: selectedPersonal.id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al cambiar la contraseña');
    }

    const data = await response.json();
    Swal.fire({
      title: 'Éxito!',
      text: 'Contraseña cambiada satisfactoriamente.',
      icon: 'success',
    });

    setIsChangePasswordOpen(false);
    setNewPassword('');
    setConfirmPassword('');
  } catch (error) {
    console.error('Error details:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Error al cambiar la contraseña',
    });
  }
};
const filteredPersonal = personal.filter((persona) => {
  const matchesSearchTerm = `${persona.name} ${persona.lastname}`.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesDefensoria = selectedDefensoria ? String(persona.defensoria) === String(selectedDefensoria) : true;
  const matchesRole = selectedRole ? persona.role.toLowerCase() === selectedRole.toLowerCase() : true;
  const matchesDocument = `${persona.document}`.includes(Docsearch);
  return matchesSearchTerm && matchesDefensoria && matchesRole && matchesDocument;});

  return (
    <div className="container-fluid">
      <div className="d-flex flex-row row">
      <h2 className="mb-2 text-center align-self-center text-light">Gestión de Personal</h2>
        <div className="search-filter mb-3 d-flex align-items-center border-1 border-bottom border-danger pb-3"> {/*Filtro de busqueda */}
          <div className="col p-2">
            <input
              className='form-control mx-1 col-1 mb-2'
              type="text"
              placeholder="Buscar por nombre o apellido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}/>
          </div>
          <div className="col p-2">
            <input
              className='form-control mx-1 col-1 mb-2'
              type="text"
              placeholder="Buscar por documento"
              value={Docsearch}
              onChange={(e) => setDocSearc(e.target.value)}/>
          </div>
          <div className="col p-2">
            <select
              className='form-select mx-1 mb-2'
              value={selectedDefensoria}
              onChange={(e) => setSelectedDefensoria(e.target.value,console.log(selectedDefensoria))} >
              <option value="">Seleccionar Defensoria</option>
              {defensorias.map((defensoria) => (
                <option key={defensoria.id} value={defensoria.id}>{defensoria.office}</option>
              ))}
            </select>
          </div>
          <div className="col p2-">
          <select
              className='form-select mx-1 mb-2'
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value,console.log(selectedRole))} >
              <option value="">Seleccionar Rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.role}>{role.role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="row row-cols-3 g-3">
        {filteredPersonal.map((persona) => {   {/* Mapeo de la información de los empleados */}
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
      <div className={`modal fade ${isFormOpen ? 'show' : ''}`} style={{ display: isFormOpen ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-center w-100">Registrar Personal</h5>
              <button type="button" className="btn-close" onClick={() => setIsFormOpen(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="d-flex flex-column align-items-center">
                <div className="mb-3 w-75">
                  <label htmlFor="name" className="form-label">Nombre</label>
                  <input id='name' name="name" className="form-control" placeholder="Nombre" required value={newPersonal.name} onChange={handleChange} />
                </div>
                <div className="mb-3 w-75">
                  <label htmlFor="lastname" className="form-label">Apellido</label>
                  <input id='lastname' name="lastname" className="form-control" placeholder="Apellido" required value={newPersonal.lastname} onChange={handleChange} />
                </div>
                <div className="mb-3 w-75">
                  <label htmlFor="typeDocument" className="form-label">Tipo de Documento</label>
                  <select id='typeDocument' name='typeDocument' className="form-select" value={newPersonal.typeDocument} onChange={handleChange} required>
                    <option value="">Seleccione un tipo</option>
                    {documentTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.type}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3 w-75">
                  <label htmlFor="document" className="form-label">Número de Documento</label>
                  <input name="document" className="form-control" placeholder="Número de Documento" required value={newPersonal.document} onChange={handleChange} />
                </div>
                <div className="mb-3 w-75">
                  <label htmlFor="role" className="form-label">Rol</label>
                  <select id='role' name='role' className="form-select" value={newPersonal.role} onChange={handleChange} required>
                    <option value="">Seleccione un Rol</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.role}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3 w-75">
                  <label htmlFor="email" className="form-label">Correo Electrónico</label>
                  <input name="email" type="email" className="form-control" placeholder="Correo Electrónico" value={newPersonal.email} onChange={handleChange} />
                </div>
                <div className="mb-3 w-75">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input name="password" type="password" className="form-control" placeholder="Contraseña" required value={newPersonal.password} onChange={handleChange} />
                </div>
                <div className="mb-3 w-75">
                  <label htmlFor="number" className="form-label">Teléfono</label>
                  <input name="number" type="tel" className="form-control" placeholder="Teléfono" required value={newPersonal.number} onChange={handleChange} />
                </div>
                <div className="mb-3 w-75">
                  <label htmlFor="defensoria" className="form-label">Defensoria</label>
                  <select id='defensoria' name='defensoria' className="form-select" value={newPersonal.defensoria} onChange={handleChange} required>
                    <option value="">Seleccione una Defensoria</option>
                    {defensorias.map((defensoria) => (
                      <option key={defensoria.id} value={defensoria.id}>{defensoria.office}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-75">Guardar</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar personal */}
      <div className={`modal fade ${selectedPersonal ? 'show' : ''}`} style={{ display: selectedPersonal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-center w-100">Editar Personal</h5>
              <button type="button" className="btn-close" onClick={() => {
                setSelectedPersonal(null);
                setEditedPersonal(null);
              }}></button>
            </div>
            <div className="modal-body">
              {editedPersonal && (
                <form onSubmit={handleEditSubmit} className="d-flex flex-column align-items-center">
                  <div className="mb-3 w-75">
                    <label htmlFor="name" className="form-label">Nombre</label>
                    <input name="name" className="form-control" value={editedPersonal.name} onChange={handleEditChange} placeholder="Nombre" />
                  </div>
                  <div className="mb-3 w-75">
                    <label htmlFor="lastname" className="form-label">Apellido</label>
                    <input name="lastname" className="form-control" value={editedPersonal.lastname} onChange={handleEditChange} placeholder="Apellido" />
                  </div>
                  <div className="mb-3 w-75">
                    <label htmlFor="typeDocument" className="form-label">Tipo de Documento</label>
                    <select name="typeDocument" className="form-select" value={editedPersonal.typeDocument} onChange={handleEditChange} required>
                      {documentTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 w-75">
                    <label htmlFor="document" className="form-label">Número de Documento</label>
                    <input name="document" className="form-control" value={editedPersonal.document} onChange={handleEditChange} placeholder="Documento" />
                  </div>
                  <div className="mb-3 w-75">
                    <label htmlFor="defensoria" className="form-label">Defensoria</label>
                    <select name="defensoria" className="form-select" value={editedPersonal.defensoria} onChange={handleEditChange} required>
                      <option value="">Seleccione una Defensoria</option>
                      {defensorias.map((defensoria) => (
                        <option key={defensoria.id} value={defensoria.id}>{defensoria.office}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 w-75">
                    <label htmlFor="role" className="form-label">Rol</label>
                    <select name="role" className="form-select" value={editedPersonal.role} onChange={handleEditChange} required>
                      {roles.map((role) => (
                        <option key={role.id} value={role.role}>{role.role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 w-75">
                    <label htmlFor="email" className="form-label">Correo Electrónico</label>
                    <input name="email" type="email" className="form-control" value={editedPersonal.email} onChange={handleEditChange} placeholder="Correo Electrónico" />
                  </div>
                  <div className="mb-3 w-75">
                    <label htmlFor="number" className="form-label">Teléfono</label>
                    <input name="number" type="tel" className="form-control" value={editedPersonal.number} onChange={handleEditChange} placeholder="Teléfono" />
                  </div>
                  <div className="d-flex justify-content-evenly w-75">
                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                    <button type="button" className="btn btn-warning d-flex flex-column align-items-center justify-content-center" onClick={() => setIsChangePasswordOpen(true)}>
                      <RectangleEllipsis size={16} className="mb-1" />
                      Editar contraseña
                    </button>
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

      {/* Modal para cambiar contraseña */}
      <div className={`modal fade ${isChangePasswordOpen ? 'show' : ''}`} style={{ display: isChangePasswordOpen ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-center w-100">Cambiar Contraseña</h5>
              <button type="button" className="btn-close" onClick={() => {setIsChangePasswordOpen(false),setNewPassword(''),setConfirmPassword('')}}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(selectedPersonal.id); }}>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
                  <input
                    id="newPassword"
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="d-flex justify-content-center">
                  <button type="submit" className="btn btn-primary">Cambiar Contraseña</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalModule;