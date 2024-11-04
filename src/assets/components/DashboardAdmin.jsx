import { useState, useEffect } from 'react'
import './DashboardAdmin.css'

export default function DashboardAdmin() {
  const [offices, setOffices] = useState([])
  const [users, setUsers] = useState([])
  const [newOfficeName, setNewOfficeName] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserPosition, setNewUserPosition] = useState('')
  const [selectedOffice, setSelectedOffice] = useState(null)
  const [expandedOffice, setExpandedOffice] = useState(null)
  const [expandedUsers, setExpandedUsers] = useState(false)
  const [showOfficeForm, setShowOfficeForm] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)

  useEffect(() => {
    // Simular carga de datos desde una base de datos local
    const mockOffices = [
      { id: 1, name: 'Oficina Central', employees: [1] },
      { id: 2, name: 'Sucursal Norte', employees: [] },
    ]
    const mockUsers = [
      { id: 1, name: 'Juan Pérez', position: 'Gerente' },
      { id: 2, name: 'Ana García', position: 'Desarrollador' },
    ]
    setOffices(mockOffices)
    setUsers(mockUsers)
  }, [])

  const addOffice = () => {
    if (newOfficeName) {
      const newOffice = {
        id: offices.length + 1,
        name: newOfficeName,
        employees: []
      }
      setOffices([...offices, newOffice])
      setNewOfficeName('')
      setShowOfficeForm(false)
    }
  }

  const addUser = () => {
    if (newUserName && newUserPosition) {
      const newUser = {
        id: users.length + 1,
        name: newUserName,
        position: newUserPosition
      }
      setUsers([...users, newUser])
      setNewUserName('')
      setNewUserPosition('')
      setShowUserForm(false)
    }
  }

  const addUserToOffice = (officeId, userId) => {
    setOffices(offices.map(office => 
      office.id === officeId
        ? { ...office, employees: [...office.employees, userId] }
        : office
    ))
  }

  const removeUserFromOffice = (officeId, userId) => {
    setOffices(offices.map(office => 
      office.id === officeId
        ? { ...office, employees: office.employees.filter(id => id !== userId) }
        : office
    ))
  }

  const toggleOffice = (officeId) => {
    setExpandedOffice(expandedOffice === officeId ? null : officeId)
  }

  const toggleUsers = () => {
    setExpandedUsers(!expandedUsers)
  }

  return (
    <div className="dashboard">
      <h1>Panel de Administrador</h1>
      
      <div className="dashboard-content">
        <div className="office-list">
          <h2>Lista de Defensorías</h2>
          {offices.map(office => (
            <div key={office.id} className="office-item">
              <h3 onClick={() => toggleOffice(office.id)}>
                {office.name} {expandedOffice === office.id ? '▼' : '▶'}
              </h3>
              {expandedOffice === office.id && (
                <div className="office-details">
                  <h4>Empleados:</h4>
                  {office.employees.length > 0 ? (
                    <ul>
                      {office.employees.map(userId => {
                        const user = users.find(u => u.id === userId)
                        return user ? (
                          <li key={user.id}>
                            {user.name} - {user.position}
                            <button onClick={() => removeUserFromOffice(office.id, user.id)}>
                              Eliminar
                            </button>
                          </li>
                        ) : null
                      })}
                    </ul>
                  ) : (
                    <p>No hay empleados en esta Defensoría.</p>
                  )}
                  <div className="add-user-to-office">
                    <select onChange={(e) => addUserToOffice(office.id, Number(e.target.value))}>
                      <option value="">Seleccionar Usuario</option>
                      {users.filter(user => !office.employees.includes(user.id)).map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                    <button onClick={() => {
                      const select = event.target.previousElementSibling
                      const userId = Number(select.value)
                      if (userId) {
                        addUserToOffice(office.id, userId)
                        select.value = ""
                      }
                    }}>
                      Agregar Usuario
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="user-list">
          <h2 onClick={toggleUsers}>
            Lista de Empleados {expandedUsers ? '▼' : '▶'}
          </h2>
          {expandedUsers && (
            <div>
              {users.map(user => (
                <div key={user.id} className="user-item">
                  {user.name} - {user.position}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="floating-buttons">
        <button onClick={() => setShowOfficeForm(!showOfficeForm)} className="add-office-button">
          {showOfficeForm ? '✕' : '+'}
        </button>
        <button onClick={() => setShowUserForm(!showUserForm)} className="add-user-button">
          {showUserForm ? '✕' : '+'}
        </button>
      </div>

      {showOfficeForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Añadir Nueva Oficina</h2>
            <input 
              type="text"
              placeholder="Nombre de la oficina" 
              value={newOfficeName} 
              onChange={(e) => setNewOfficeName(e.target.value)}
            />
            <button onClick={addOffice}>Añadir Oficina</button>
            <button onClick={() => setShowOfficeForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {showUserForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Añadir Nuevo Usuario</h2>
            <input 
              type="text"
              placeholder="Nombre del usuario" 
              value={newUserName} 
              onChange={(e) => setNewUserName(e.target.value)}
            />
            <input 
              type="text"
              placeholder="Posición del usuario" 
              value={newUserPosition} 
              onChange={(e) => setNewUserPosition(e.target.value)}
            />
            <button onClick={addUser}>Añadir Usuario</button>
            <button onClick={() => setShowUserForm(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}