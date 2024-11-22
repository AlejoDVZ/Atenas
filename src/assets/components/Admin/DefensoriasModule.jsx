import { useEffect, useState } from 'react';
import './DefensoriasModule.css';

function DefensoriasModule() {
  const [defensorias, setDefensorias] = useState([{
    id: '',
    office: '',
    number : ''
  }]);
  const [newDefensoria,setNewDefensoria] = useState({
    id: '',
    number : ''
  })
  const [selectedDefensoria, setSelectedDefensoria] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);


  useEffect(()=>{
    fetchDefensorias();
  },[]
  );
  const fetchDefensorias = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/defensorias',{
        method: 'GET'
      });
      const data = await response.json();
      setDefensorias(data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };
  const handleDefensoriaClick = (defensoria) => {
    setSelectedDefensoria(defensoria);
    const id = defensoria.id;
    console.log('este es el id',id)
    console.log('defensoria pela',defensoria)
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newDefensoria.number) {
      alert('Por favor, complete todos los campos.');
      return;
    }try{
      
    
      const response = await fetch('http://localhost:3300/register/defensoria', { // Cambia la URL a la de tu API
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
      setNewDefensoria({ number: '' }); // Resetear el formulario
      fetchDefensorias();
    } catch (error) {
      alert(error)
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
            id : id
          }),
        });
        if (response.ok) {
          alert('Defensoria Borrada')
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

    <div className="defensorias-module">
      <h2 className="module-title">Gestión de Defensorías</h2>
      <div className="defensorias-grid">
        {defensorias.map((defensoria) => (
          <div key={defensoria.id} className="defensoria-card" onClick={() => handleDefensoriaClick(defensoria)}>
            <h3>Defensoría: {defensoria.number}</h3>
          </div>

        ))}
      </div>
      <button className="add-button" onClick={() => setIsFormOpen(true)}>+</button>
      {isFormOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Registrar Defensoría</h3>
            <form onSubmit={handleSubmit}>
              <div id="phone">
                <input id='number' name="number" placeholder="Numero de la defensoría" required  //nombre
                value={newDefensoria.number} onChange={handleChange} />
              </div>
              
              <button type="submit">Guardar</button>
            </form>
            <button className="close-button" id='close-button' onClick={() => setIsFormOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
      {selectedDefensoria && (
        <div className="modal">
          <div className="modal-content">
            <h3>Defensoría: {selectedDefensoria.number}</h3>
              <button id='delete-button' onClick={() => handleDelete(selectedDefensoria.id)}>Borrar</button>
            <button className="close-button" onClick={() => setSelectedDefensoria(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DefensoriasModule;