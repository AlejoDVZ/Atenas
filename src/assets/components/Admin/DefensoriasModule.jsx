import { useState } from 'react';
import './DefensoriasModule.css';

const defensoriaMock = [
  { id: 1, nombre: 'Defensoría 1', personal: [{ id: 1, nombre: 'Juan', apellido: 'Pérez' }] },
  { id: 2, nombre: 'Defensoría 2', personal: [] },
];

function DefensoriasModule() {
  const [defensorias, setDefensorias] = useState(defensoriaMock);
  const [selectedDefensoria, setSelectedDefensoria] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newDefensoria = {
      id: defensorias.length + 1,
      nombre: formData.get('nombre'),
      personal: [],
    };
    setDefensorias([...defensorias, newDefensoria]);
    setIsFormOpen(false);
  };

  const handleAddPersonal = (defensoria, personal) => {
    const updatedDefensorias = defensorias.map(d => {
      if (d.id === defensoria.id) {
        return { ...d, personal: [...d.personal, personal] };
      }
      return d;
    });
    setDefensorias(updatedDefensorias);
  };

  const handleRemovePersonal = (defensoria, personalId) => {
    const updatedDefensorias = defensorias.map(d => {
      if (d.id === defensoria.id) {
        return { ...d, personal: d.personal.filter(p => p.id !== personalId) };
      }
      return d;
    });
    setDefensorias(updatedDefensorias);
  };

  return (

    <div className="defensorias-module">
      <h2 className="module-title">Gestión de Defensorías</h2>
      <div className="defensorias-grid">
        {defensorias.map((defensoria) => (
          <div key={defensoria.id} className="defensoria-card" onClick={() => setSelectedDefensoria(defensoria)}>
            <h3>{defensoria.nombre}</h3>
            <p>Personal: {defensoria.personal.length}</p>
          </div>

        ))}
      </div>
      <button className="add-button" onClick={() => setIsFormOpen(true)}>+</button>
      {isFormOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Registrar Defensoría</h3>
            <form onSubmit={handleSubmit}>
              <input name="nombre" placeholder="Nombre de la Defensoría" required />
              <button type="submit">Guardar</button>
            </form>
            <button className="close-button" onClick={() => setIsFormOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
      {selectedDefensoria && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedDefensoria.nombre}</h3>
            <h4>Personal Asignado</h4>
            {selectedDefensoria.personal.length === 0 ? (
              <p>Esta defensoría no tiene personal registrado.</p>
            ) : (
              <ul>
                {selectedDefensoria.personal.map((persona) => (
                  <li key={persona.id}>
                    <p>{persona.nombre} {persona.apellido}</p>
                    <button onClick={() => handleRemovePersonal(selectedDefensoria, persona.id)}>Eliminar</button>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newPersonal = {
                id: Date.now(),
                nombre: formData.get('nombre'),
                apellido: formData.get('apellido'),
              };
              handleAddPersonal(selectedDefensoria, newPersonal);
              e.target.reset();
            }}>
              <input name="nombre" placeholder="Nombre" required />
              <input name="apellido" placeholder="Apellido" required />
              <button type="submit">Agregar Personal</button>
            </form>
            <button className="close-button" onClick={() => setSelectedDefensoria(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DefensoriasModule;