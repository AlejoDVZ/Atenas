import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search } from 'lucide-react';
import Swal from 'sweetalert2';

function CalificationsModule() {
  const [califications, setCalifications] = useState([]);
  const [filteredCalifications, setFilteredCalifications] = useState([]);
  const [newCalification, setNewCalification] = useState({
    calificacion: ''
  });
  const [editingCalification, setEditingCalification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCalifications();
  }, []);

  useEffect(() => {
    const filtered = califications.filter(cal => 
      cal.calificacion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCalifications(filtered);
  }, [searchTerm, califications]);

  const fetchCalifications = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/calificaciones');
      const data = await response.json();
      setCalifications(data);
      setFilteredCalifications(data);
    } catch (error) {
      console.error('Error fetching califications:', error);
    }
  };

 const handleAddCalification = async () => {
  const { calificacion } = newCalification;
  if (!calificacion.trim()) {
    console.error('La calificación no puede estar vacía');
    return Swal.fire({ title: 'Falta la calificación', icon: 'error' });
  }
  
  try {
    const response = await fetch('http://localhost:3300/register/calificacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calificacion: calificacion.trim() }),
    });

    if (response.ok) {
      setNewCalification({ calificacion: '' });
      fetchCalifications();
      Swal.fire({ title: 'Calificación agregada', icon: 'success' });
    } else {
      const errorData = await response.json();
      Swal.fire({ title: 'Error', text: errorData.error || 'Error al agregar la calificación', icon: 'error' });
    }
  } catch (error) {
    console.error('Error adding calification:', error);
    Swal.fire({ title: 'Error', text: 'Error al agregar la calificación', icon: 'error' });
  } finally {
    Swal.close();
  }
};

  const handleEditCalification = async (id, newCalification) => {
    try {
      const response = await fetch(`http://localhost:3300/califications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calificacion: newCalification }),
      });
      if (response.ok) {
        setEditingCalification(null);
        fetchCalifications();
      }
    } catch (error) {
      console.error('Error editing calification:', error);
    }
  };

  const handleDeleteCalification = async (cid) => {
    try {
      const response = await fetch(`http://localhost:3300/delete/calificacion`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: cid })
      });
      if (response.ok) {
        fetchCalifications();
        Swal.fire({title:'Calificación eliminada',icon:'success'});
      } else {
        const errorData = await response.json();
        Swal.fire({title:'Error',text:errorData.error || 'Error al eliminar la calificación',icon:'error'});
      }
    } catch (error) {
      console.error('Error deleting calification:', error);
      Swal.fire({title:'Error',text:'Error al eliminar la calificación',icon:'error'});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCalification((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-light text-center">Gestión de Calificaciones</h2>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group d-flex flex-row">
            <input
              type="text"
              className="form-control w-50"
              name='calificacion'
              value={newCalification.calificacion}
              onChange={handleChange}
              placeholder="Nueva calificación"
            />
            <button className="btn btn-primary" onClick={handleAddCalification}>
              <Plus size={16} /> Agregar Calificación
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="input-group d-flex flex-row">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control w-50"
              placeholder="Buscar calificaciones..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>
      <ul className="list-group">
        {filteredCalifications.map((calification) => (
          <li key={calification.id} className="list-group-item d-flex justify-content-between align-items-center">
            {editingCalification === calification.id ? (
              <input
                type="text"
                className="form-control"
                value={calification.calificacion}
                onChange={(e) => {
                  const updatedCalifications = califications.map(c =>
                    c.id === calification.id ? { ...c, calificacion: e.target.value } : c
                  );
                  setCalifications(updatedCalifications);
                }}
              />
            ) : (
              calification.calificacion
            )}
            <div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCalification(calification.id)}>
                <Trash size={16} /> Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
      {filteredCalifications.length === 0 && (
        <p className="text-center mt-3">No se encontraron calificaciones.</p>
      )}
    </div>
  );
}

export default CalificationsModule;

