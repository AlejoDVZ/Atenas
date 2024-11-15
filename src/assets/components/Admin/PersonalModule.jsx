import { useState } from 'react';
import './PersonalModule.css';

const personalMock = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', documento: '12345678', tipoDocumento: 'DNI', rol: 'Abogado', defensoria: 'Defensoría 1', correo: 'juan@example.com', telefono: '123456789' },
  { id: 2, nombre: 'María', apellido: 'González', documento: '87654321', tipoDocumento: 'Pasaporte', rol: 'Asistente', defensoria: 'No asignado', correo: 'maria@example.com', telefono: '987654321' },
];

function PersonalModule() {
  const [personal, setPersonal] = useState(personalMock);
  const [selectedPersonal, setSelectedPersonal] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newPersonal = {
      id: personal.length + 1,
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      documento: formData.get('documento'),
      tipoDocumento: formData.get('tipoDocumento'),
      rol: formData.get('rol'),
      defensoria: formData.get('defensoria'),
      correo: formData.get('correo'),
      telefono: formData.get('telefono'),
    };
    setPersonal([...personal, newPersonal]);
    setIsFormOpen(false);
  };

  return (
    <div className="personal-module">
      <h2 className="module-title">Gestión de Personal</h2>
      <div className="personal-grid">
        {personal.map((persona) => (
          <div key={persona.id} className="personal-card" onClick={() => setSelectedPersonal(persona)}>
            <h3>{persona.nombre} {persona.apellido}</h3>
            <p>Documento: {persona.tipoDocumento} {persona.documento}</p>
            <p>Rol: {persona.rol}</p>
            <p>Defensoría: {persona.defensoria}</p>
          </div>
        ))}
      </div>
      <button className="add-button" onClick={() => setIsFormOpen(true)}>+</button>
      {isFormOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Registrar Personal</h3>
            <form onSubmit={handleSubmit}>
              <input name="nombre" placeholder="Nombre" required />
              <input name="apellido" placeholder="Apellido" required />
              <select name="tipoDocumento" required>
                <option value="">Tipo de Documento</option>
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Carnet de Extranjería">Carnet de Extranjería</option>
              </select>
              <input name="documento" placeholder="Número de Documento" required />
              <input name="rol" placeholder="Rol" required />
              <input name="defensoria" placeholder="Defensoría" />
              <input name="correo" type="email" placeholder="Correo Electrónico" required />
              <input name="telefono" type="tel" placeholder="Teléfono" required />
              <button type="submit">Guardar</button>
            </form>
            <button className="close-button" onClick={() => setIsFormOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
      {selectedPersonal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Editar Personal</h3>
            <form>
              <input defaultValue={selectedPersonal.nombre} placeholder="Nombre" />
              <input defaultValue={selectedPersonal.apellido} placeholder="Apellido" />
              <select defaultValue={selectedPersonal.tipoDocumento}>
                <option value="">Tipo de Documento</option>
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Carnet de Extranjería">Carnet de Extranjería</option>
              </select>
              <input defaultValue={selectedPersonal.documento} placeholder="Número de Documento" />
              <input defaultValue={selectedPersonal.rol} placeholder="Rol" />
              <input defaultValue={selectedPersonal.defensoria} placeholder="Defensoría" />
              <input defaultValue={selectedPersonal.correo} type="email" placeholder="Correo Electrónico" />
              <input defaultValue={selectedPersonal.telefono} type="tel" placeholder="Teléfono" />
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