import { useState } from 'react';
import './UsuariosModule.css';

const usuariosMock = [
  { id: 1, nombre: 'DDPP01@atenas.com', defensoria: 'Defensoría 1' },
  { id: 2, nombre: 'DDPP02@atenas.com', defensoria: 'Defensoría 2' },
];

const defensoriaMock = ['Defensoría 1', 'Defensoría 2', 'Defensoría 3'];

function UsuariosModule() {
  const [usuarios, setUsuarios] = useState(usuariosMock);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const defensoria = formData.get('defensoria');
    const defensoriaNumber = defensoria.split(' ')[1];
    const newUsuario = {
      id: usuarios.length + 1,
      nombre: `DDPP${defensoriaNumber.padStart(2, '0')}@atenas.com`,
      defensoria: defensoria,
    };
    setUsuarios([...usuarios, newUsuario]);
    setIsFormOpen(false);
  };

  const handleDeleteUsuario = (id) => {
    setUsuarios(usuarios.filter(usuario => usuario.id !== id));
  };

  return (
    <div className="usuarios-module">
      <h2 className="module-title">Gestión de Usuarios</h2>
      <div className="usuarios-grid">
        {usuarios.map((usuario) => (
          <div key={usuario.id} className="usuario-card">
            <div>
              <h3>{usuario.nombre}</h3>
              <p>{usuario.defensoria}</p>
            </div>
            <button className="delete-button" onClick={() => handleDeleteUsuario(usuario.id)}>Eliminar</button>
          </div>
        ))}
      </div>
      <button className="add-button" onClick={() => setIsFormOpen(true)}>+</button>
      {isFormOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Registrar Usuario</h3>
            <form onSubmit={handleSubmit}>
              <select name="defensoria" required>
                <option value="">Seleccione una defensoría</option>
                {defensoriaMock.map((defensoria, index) => (
                  <option key={index} value={defensoria}>
                    {defensoria}
                  </option>
                ))}
              </select>
              <button type="submit">Crear Usuario</button>
            </form>
            <button className="close-button" onClick={() => setIsFormOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuariosModule;