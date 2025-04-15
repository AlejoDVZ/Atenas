import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Plus, Trash2 } from 'lucide-react';
import './FiscaliaModule.css';

function FiscaliasModule() {
  const [fiscalias, setFiscalias] = useState([]);
  const [newFiscalia, setNewFiscalia] = useState({
    number: ''
  });
  const [selectedFiscalia, setSelectedFiscalia] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchFiscalias();
  }, []);

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

  const handleFiscaliaClick = (fiscalia) => {
    setSelectedFiscalia(fiscalia);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newFiscalia.number) {
      await Swal.fire({
        title: 'Error',
        text: 'Por favor, complete todos los campos.',
        icon: 'error'
      });
      return;
    }
    try {
      const response = await fetch('http://localhost:3300/register/fiscalia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: newFiscalia.number
        }),
      });
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Fiscalia registrada correctamente',
        icon: 'success'
      });
      setIsFormOpen(false);
      setNewFiscalia({ number: '' });
      fetchFiscalias();
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Hubo un error al registrar la Fiscalia',
        icon: 'error'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewFiscalia((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres borrar esta Fiscalia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('http://localhost:3300/disable/fiscalia', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: id
          }),
        });
        if (response.ok) {
          await Swal.fire({
            title: '¡Borrado!',
            text: 'La Fiscalia ha sido borrada.',
            icon: 'success'
          });
          fetchFiscalias();
          setSelectedFiscalia(null);
        } else {
          throw new Error('Error al borrar la Fiscalia');
        }
      } catch (error) {
        console.error('Error al borrar la Fiscalia:', error);
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un error al borrar la Fiscalia. Por favor, inténtalo de nuevo.',
          icon: 'error'
        });
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4 text-center text-light">Gestión de Fiscalias</h2>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {fiscalias.map((fiscalia) => (
          <div key={fiscalia.id} className="col">
            <div className="card h-100" onClick={() => handleFiscaliaClick(fiscalia)}>
              <div className="card-body">
                <h5 className="card-title">Defensoría: {fiscalia.number}</h5>
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
              <h5 className="modal-title">Registrar Fiscalia</h5>
              <button type="button" className="btn-close" onClick={() => setIsFormOpen(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input id='number' name="number" className="form-control" placeholder="Numero de la Fiscalia" value={newFiscalia.number} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para ver/borrar defensoría */}
      <div className={`modal fade ${selectedFiscalia ? 'show' : ''}`} style={{display: selectedFiscalia ? 'block' : 'none'}} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Fiscalia: {selectedFiscalia?.number}</h5>
              <button type="button" className="btn-close" onClick={() => setSelectedFiscalia(null)}></button>
            </div>
            <div className="modal-body">
              <p>Número de Fiscalia: {selectedFiscalia?.number}</p>
              <button className="btn btn-danger" onClick={() => handleDelete(selectedFiscalia?.id)}>
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

export default FiscaliasModule;