import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import './DefensoriasModule.css';
import Swal from 'sweetalert2';

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
      if (!response.ok) {
        throw new Error('Error al obtener las defensorías');
      }
      const data = await response.json();
      setDefensorias(data);
    } catch (error) {
      console.error('Error fetching defensorias:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: `No se pudieron cargar las defensorías: ${error.message || error}`,
        footer: 'Por favor, verifique su conexión e inténtelo de nuevo.',
        confirmButtonText: 'Cerrar'
      });
    }
  };

  const handleDefensoriaClick = (defensoria) => {
    setSelectedDefensoria(defensoria);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newDefensoria.number) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Por favor, complete todos los campos requeridos.',
        confirmButtonText: 'Entendido'
      });
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
      Swal.fire({
        icon: 'success',
        title: '¡Registro Exitoso!',
        text: 'La Defensoría ha sido registrada correctamente.',
        confirmButtonText: 'Continuar'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Registro',
        text: `No se pudo registrar la Defensoría: ${error.message || error}`,
        footer: 'Por favor, inténtelo de nuevo más tarde.',
        confirmButtonText: 'Cerrar'
      });
      console.error('Error al enviar los datos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDefensoria((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
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
          Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'La Defensoría ha sido eliminada correctamente.',
            confirmButtonText: 'Continuar'
          });
          fetchDefensorias();
          setSelectedDefensoria(null);
        } else {
          throw new Error('Error al borrar la Defensoria');
        }
      } catch (error) {
        console.error('Error al borrar la Defensoria:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al Eliminar',
          text: `No se pudo eliminar la Defensoría: ${error.message || error}`,
          footer: 'Por favor, inténtelo de nuevo más tarde.',
          confirmButtonText: 'Cerrar'
        });
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
                  <input id='number' name="number" className="form-control" placeholder="Numero de la defensoría" value={newDefensoria.number} onChange={handleChange} />
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