import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search } from 'lucide-react';
import Swal from 'sweetalert2';

function DetentionCentersModule() {
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [newCenter, setNewCenter] = useState('');
  const [editingCenter, setEditingCenter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    const filtered = centers.filter(center => 
      center.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCenters(filtered);
  }, [searchTerm, centers]);

  const fetchCenters = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/detentioncenters');
      const data = await response.json();
      setCenters(data);
      setFilteredCenters(data);
    } catch (error) {
      console.error('Error fetching detention centers:', error);
      Swal.fire({title: 'Error', text: 'Error al cargar los centros de reclusión', icon: 'error'});
    }
  };

  const handleAddCenter = async () => {
    if (!newCenter.trim()) {
      return Swal.fire({title: 'Error', text: 'El nombre del centro no puede estar vacío', icon: 'error'});
    }
    
    try {
      const response = await fetch('http://localhost:3300/register/detentioncenter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCenter.trim() }),
      });

      if (response.ok) {
        setNewCenter('');
        fetchCenters();
        Swal.fire({title: 'Éxito', text: 'Centro de reclusión agregado', icon: 'success'});
      } else {
        const errorData = await response.json();
        Swal.fire({title: 'Error', text: errorData.error || 'Error al agregar el centro de reclusión', icon: 'error'});
      }
    } catch (error) {
      console.error('Error adding detention center:', error);
      Swal.fire({title: 'Error', text: 'Error al agregar el centro de reclusión', icon: 'error'});
    }
  };

  const handleEditCenter = async (id, newName) => {
    if (!newName.trim()) {
      return Swal.fire({title: 'Error', text: 'El nombre del centro no puede estar vacío', icon: 'error'});
    }

    try {
      const response = await fetch(`http://localhost:3300/update/detentioncenter/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        setEditingCenter(null);
        fetchCenters();
        Swal.fire({title: 'Éxito', text: 'Centro de reclusión actualizado', icon: 'success'});
      } else {
        const errorData = await response.json();
        Swal.fire({title: 'Error', text: errorData.error || 'Error al actualizar el centro de reclusión', icon: 'error'});
      }
    } catch (error) {
      console.error('Error editing detention center:', error);
      Swal.fire({title: 'Error', text: 'Error al actualizar el centro de reclusión', icon: 'error'});
    }
  };

  const handleDeleteCenter = async (cid) => {
    console.log('id del centro',cid)
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:3300/delete/detentioncenter`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id : cid })
        });

        if (response.ok) {
          fetchCenters();
          Swal.fire({title: 'Eliminado', text: 'El centro de reclusión ha sido eliminado', icon: 'success'});
        } else {
          const errorData = await response.json();
          Swal.fire({title: 'Error', text: errorData.error || 'Error al eliminar el centro de reclusión', icon: 'error'});
        }
      } catch (error) {
        console.error('Error deleting detention center:', error);
        Swal.fire({title: 'Error', text: 'Error al eliminar el centro de reclusión', icon: 'error'});
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-light text-center">Gestión de Centros de Reclusión</h2>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group d-flex flex-row">
            <input
              type="text"
              className="form-control w-50"
              value={newCenter}
              onChange={(e) => setNewCenter(e.target.value)}
              placeholder="Nuevo centro de reclusión"
            />
            <button className="btn btn-primary" onClick={handleAddCenter}>
              <Plus size={16} /> Agregar Centro
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
              placeholder="Buscar centros..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>
      <ul className="list-group">
        {filteredCenters.map((center) => (
          <li key={center.id} className="list-group-item d-flex justify-content-between align-items-center">
            {editingCenter === center.id ? (
              <input
                type="text"
                className="form-control"
                value={center.name}
                onChange={(e) => {
                  const updatedCenters = centers.map(c =>
                    c.id === center.id ? { ...c, name: e.target.value } : c
                  );
                  setCenters(updatedCenters);
                }}
              />
            ) : (
              center.name
            )}
            <div>
              {editingCenter === center.id ? (
                <button className="btn btn-success btn-sm me-2" onClick={() => handleEditCenter(center.id, center.name)}>
                  Guardar
                </button>
              ) : (
                <button className="btn btn-warning btn-sm me-2" onClick={() => setEditingCenter(center.id)}>
                  <Edit size={16} /> Editar
                </button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCenter(center.id)}>
                <Trash size={16} /> Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
      {filteredCenters.length === 0 && (
        <p className="text-center mt-3">No se encontraron centros de reclusión.</p>
      )}
    </div>
  );
}

export default DetentionCentersModule;