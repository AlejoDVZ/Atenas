import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import './DefensoriasModule.css';

function DefensoriasModule() {
  const [defensorias, setDefensorias] = useState([]);
  const [newDefensoria, setNewDefensoria] = useState({
    number: ''
  });
  const [selectedDefensoria, setSelectedDefensoria] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchDefensorias();
  }, []);

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

  const handleDefensoriaClick = (defensoria) => {
    setSelectedDefensoria(defensoria);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newDefensoria.number) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3300/register/defensoria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: newDefensoria.number
        }),
      });
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      setIsFormOpen(false);
      setNewDefensoria({ number: '' });
      fetchDefensorias();
    } catch (error) {
      alert(error);
      console.error('Error al enviar los datos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDefensoria((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres borrar esta Defensoria?')) {
      try {
        const response = await fetch('http://localhost:3300/delete/defensoria', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: id
          }),
        });
        if (response.ok) {
          alert('Defensoria Borrada');
          fetchDefensorias();
          setSelectedDefensoria(null);
        } else {
          throw new Error('Error al borrar la Defensoria');
        }
      } catch (error) {
        console.error('Error al borrar la Defensoria:', error);
        alert('Hubo un error al borrar la Defensoria. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4 text-center text-light">Gestión de Defensorías</h2>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {defensorias.map((defensoria) => (
          <div key={defensoria.id} className="col">
            <div className="card h-100" onClick={() => handleDefensoriaClick(defensoria)}>
              <div className="card-body">
                <h5 className="card-title">Defensoría: {defensoria.number}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary position-fixed bottom-0 end-0 m-3" onClick={() => setIsFormOpen(true)}>
        <Plus size={24} />
      </button>

      {/* Modal para agregar nueva defensoría */}
      <div className={`modal fade ${isFormOpen ? 'show' : ''}`} style={{display: isFormOpen ? 'block' : 'none'}} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Registrar Defensoría</h5>
              <button type="button" className="btn-close" onClick={() => setIsFormOpen(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input id='number' name="number" className="form-control" placeholder="Numero de la defensoría" required value={newDefensoria.number} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para ver/borrar defensoría */}
      <div className={`modal fade ${selectedDefensoria ? 'show' : ''}`} style={{display: selectedDefensoria ? 'block' : 'none'}} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Defensoría: {selectedDefensoria?.number}</h5>
              <button type="button" className="btn-close" onClick={() => setSelectedDefensoria(null)}></button>
            </div>
            <div className="modal-body">
              <p>Número de Defensoría: {selectedDefensoria?.number}</p>
              <button className="btn btn-danger" onClick={() => handleDelete(selectedDefensoria?.id)}>
                <Trash2 size={16} className="me-2" />
                Borrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DefensoriasModule;