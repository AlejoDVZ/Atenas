import { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Form, Row, Col } from 'react-bootstrap';

const DefendantRegistrationForm = ({ 
  documentTypes, 
  educationLevels, 
  detentionCenters, 
  onSubmit, 
  onCancel 
}) => {
  const [defendant, setDefendant] = useState({
    name: '',
    lastname: '',
    typeDocument: '',
    document: '',
    birth: null,
    education: '',
    captureOrder: false,
    gender: '',
    isDetained: false,
    detentionCenter: '',
    detentionDate: null
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDefendant(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date, field) => {
    setDefendant(prev => ({ ...prev, [field]: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(defendant);
  };
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return (
    <Form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
      
      <Row className="mb-3">
        <Col>
          <Form.Group controlId="name">
            <Form.Label>Nombre:</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={defendant.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="lastname">
            <Form.Label>Apellido:</Form.Label>
            <Form.Control
              type="text"
              name="lastname"
              value={defendant.lastname}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Group controlId="typeDocument">
            <Form.Label>Tipo de Documento:</Form.Label>
            <Form.Select
              name="typeDocument"
              value={defendant.typeDocument}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un tipo</option>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.type}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        {defendant.typeDocument !== '3' &&(
          <Col className=''>
            <Form.Group controlId="document">
              <Form.Label>Número de Documento:</Form.Label>
              <Form.Control
                type="text"
                name="document"
                value={defendant.document}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        )}
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Group controlId="birth">
            <Form.Label>Fecha de Nacimiento:</Form.Label>
            <DatePicker
              selected={defendant.birth}
              onChange={(date) => handleDateChange(date, 'birth')}
              maxDate= {minDate}
              className="form-control"
              dateFormat="dd/MM/yyyy"
              showYearDropdown
              scrollableYearDropdown
              required
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="education">
            <Form.Label>Nivel de Educación:</Form.Label>
            <Form.Select
              name="education"
              value={defendant.education}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un nivel</option>
              {educationLevels.map((level) => (
                <option key={level.id} value={level.id}>{level.level}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Group controlId="gender">
            <Form.Label>Género:</Form.Label>
            <Form.Select
              name="gender"
              value={defendant.gender}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione el género</option>
              <option value="0">Hombre</option>
              <option value="1">Mujer</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col className="d-flex align-items-center">
          <Form.Check
            type="checkbox"
            id="isDetained"
            name="isDetained"
            label="Está detenido"
            checked={defendant.isDetained}
            onChange={handleChange}
          />
        </Col>
      </Row>

      {defendant.isDetained && (
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="detentionCenter">
              <Form.Label>Centro de detención:</Form.Label>
              <Form.Select
                name="detentionCenter"
                value={defendant.detentionCenter}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un centro</option>
                {detentionCenters.map((center) => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="detentionDate">
              <Form.Label>Fecha de detención:</Form.Label>
              <DatePicker
                selected={defendant.detentionDate}
                onChange={(date) => handleDateChange(date, 'detentionDate')}
                maxDate={new Date()}
                className="form-control"
                dateFormat="dd/MM/yyyy"
                required
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {!defendant.isDetained && (
        <Form.Group className="mb-3" controlId="captureOrder">
          <Form.Check
            type="checkbox"
            name="captureOrder"
            label="Orden de Captura"
            checked={defendant.captureOrder}
            onChange={handleChange}
          />
        </Form.Group>
      )}

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" type="submit">Guardar</Button>
      </div>
    </Form>
  );
};

export default DefendantRegistrationForm;

