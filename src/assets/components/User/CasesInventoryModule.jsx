import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import styled from 'styled-components';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const StatusBadge = styled.span`
  padding: 0.25em 0.5em;
  border-radius: 0.25em;
  font-weight: bold;
  color: white;
  background-color: ${props => {
    switch (props.status) {
      case 'Activa': return '#28a745';
      case 'Cerrada Administrativamente': return '#dc3545';
      case 'Terminada': return '#17a2b8';
      case 'Paralizada': return '#ffc107';
      default: return '#6c757d';
    }
  }};
`;

export default function CasesInventoryModule({ id, def }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusStats, setStatusStats] = useState({});
  const [libertyStats, setLibertyStats] = useState({});

  useEffect(() => {
    fetchCases();
  }, [def]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3300/cases-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ def })
      });
      const data = await response.json();
      setCases(data);
      fetchStatistics();
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:3300/case-statistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ def })
      });
      const data = await response.json();
      setStatusStats(data.statusStats.reduce((acc, stat) => {
        acc[stat.state] = stat.count;
        return acc;
      }, {}));
      setLibertyStats(data.libertyStats.reduce((acc, stat) => {
        acc[stat.liberty_status] = stat.count;
        return acc;
      }, {}));
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };
  const columns = [
    {
      name: 'Número',
      selector: row => row.numberCausa,
      sortable: true,
    },
    {
      name: 'Tribunal',
      selector: row => row.tribunalRecord,
      sortable: true,
    },
    {
      name: 'Fecha de Inicio',
      selector: row => row.dateB,
      sortable: true,
      format: row => new Date(row.dateB).toLocaleDateString(),
    },
    {
      name: 'Fecha de Aceptación',
      selector: row => row.dateA,
      sortable: true,
      format: row => new Date(row.dateA).toLocaleDateString(),
    },
    {
      name: 'Fiscalía',
      selector: row => row.fiscalia,
      sortable: true,
    },
    {
      name: 'Defendidos',
      cell: row => (
        <div>
          {row.defendants.map((defendant, index) => (
            <div key={index}>
              {`${defendant.name} ${defendant.lastname} - ${defendant.typeDocument}: ${defendant.document}`}
              <br />
              {`Estado: ${defendant.stablisment ? 'Detenido' : defendant.captureOrder ? 'Orden de captura' : 'Libre'}`}
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Estado',
      selector: row => row.state,
      sortable: true,
      cell: row => <StatusBadge status={row.state}>{row.state}</StatusBadge>,
    },
    {
      name: 'Acciones',
      cell: row => (
        <button className='btn btn-outline-success btn-sm' onClick={() => generatePDF(row)}>Descargar PDF</button>
      ),
    },
  ];

  const generatePDF = async (caseData) => {
    const doc = new jsPDF();
    
    // Add logo
    const logoUrl = '/LOGO-DP-a-610px.png'; // Asegúrate de que esta ruta sea correcta
    const logoWidth = 50; // Ajusta según sea necesario
    const logoHeight = 20; // Ajusta según sea necesario
    doc.addImage(logoUrl, 'PNG', 14, 10, logoWidth, logoHeight);
  
    // Add case number
    doc.setFontSize(16);
    doc.text(`Caso #${caseData.numberCausa}`, 14, logoHeight + 20);
  
    // Add report title
    doc.setFontSize(14);
    doc.text(`Informe del Caso`, 14, logoHeight + 30);
    
    const caseDetails = [
      ['Defensoria',def],
      ['Número de Causa', caseData.numberCausa],
      ['Tribunal', caseData.tribunalRecord],
      ['Fecha de Inicio', new Date(caseData.dateB).toLocaleDateString()],
      ['Fecha de Aceptación', new Date(caseData.dateA).toLocaleDateString()],
      ['Fiscalía', caseData.fiscalia],
      ['Estado', caseData.state],
    ];
  
    doc.autoTable({
      startY: logoHeight + 35,
      body: caseDetails,
      styles:{
        textColor:[(0,0,0)],
      }
    });
  
    doc.text('Defendidos', 14, doc.lastAutoTable.finalY + 10);
    const defendantsData = caseData.defendants.map(d => [
      `${d.name} ${d.lastname}`,
      d.typeDocument,
      d.document,
      d.stablisment ? 'Detenido' : d.captureOrder ? 'Orden de captura' : 'Libre'
    ]);
  
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Nombre', 'Tipo Doc.', 'Documento', 'Estado']],
      body: defendantsData,
    });
  
    try {
      const response = await fetch('http://localhost:3300/actuaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: caseData.id })
      });
      const proceedings = await response.json();
      
      doc.text('Actuaciones', 14, doc.lastAutoTable.finalY + 10);
      const proceedingsData = proceedings.map(p => [
        new Date(p.dateReport).toLocaleDateString(),
        p.actividad,
        p.resultado
      ]);
  
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Fecha', 'Actividad', 'Resultado']],
        body: proceedingsData,
      });
    } catch (error) {
      console.error('Error fetching proceedings:', error);
    }
  
    doc.save(`Caso_${caseData.numberCausa}.pdf`);
  };

  return (
    <div className="container-fluid">
      <h2 className="mt-4 mb-4 text-center">Inventario de Casos</h2>
      <div className="row d-flex flex-row justify-content-evenly align-items-top">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Estado de Casos</h4>
            </div>
            <div className="card-body">
              {Object.entries(statusStats).map(([status, count]) => (
                <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                  <span>{status}:</span>
                  <span className="badge bg-secondary">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">Estado de Libertad de Defendidos</h4>
            </div>
            <div className="card-body">
              {Object.entries(libertyStats).map(([status, count]) => (
                <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                  <span>{status}:</span>
                  <span className="badge bg-secondary">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <DataTable
            columns={columns}
            data={cases}
            pagination
            progressPending={loading}
            highlightOnHover
            pointerOnHover
            className="border"
          />
        </div>
      </div>
    </div>
  );
}