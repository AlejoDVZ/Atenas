import React, { useState, useEffect, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import styled from 'styled-components';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';

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
  const [documentTypes, setDocumentTypes] = useState([]);
  const [califications, setCalifications] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusStats, setStatusStats] = useState({});
  const [libertyStats, setLibertyStats] = useState({});
  const [filters, setFilters] = useState({
    dateRange: [null, null],
    status: '',
    calification: '',
    libertyStatus: '',
    defensoria: def
  });
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  useEffect(() => {
    fetchCalifications();
    fetchCases();
  }, [def]);

  useEffect(() => {
    fetchDocumentTypes();
    applyFilters();
  }, [cases, filters, filterText]);

  const fetchCalifications = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/calificaciones');
      const data = await response.json();
      setCalifications(data);
    } catch (error) {
      Swal.fire({title:'Algo Salio mal!',text:error});
      console.error('Error fetching califications:', error);
    }
  };

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
      Swal.fire({title:'Algo salio mal',text:'Error al cargar casos' + error,icon:'error'});
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = cases;
    const { dateRange, status, calification, libertyStatus } = filters;
    const [startDate, endDate] = dateRange;

    if (startDate && endDate) {
      filtered = filtered.filter(c => {
        const caseDate = new Date(c.dateB);
        return caseDate >= startDate && caseDate <= endDate;
      });
    }

    if (status) {
      filtered = filtered.filter(c => c.state === status);
    }

    if (calification) {
      filtered = filtered.filter(c => c.calification === calification);
    }

    if (libertyStatus) {
      filtered = filtered.filter(c => 
        c.defendants.some(d => 
          (libertyStatus === 'Detenido' && d.stablisment) ||
          (libertyStatus === 'Orden de captura' && d.captureOrder) ||
          (libertyStatus === 'Libre' && !d.stablisment && !d.captureOrder)
        )
      );
    }

    // Apply text search
    if (filterText) {
      filtered = filtered.filter(item => {
        return (
          (item.numberCausa && item.numberCausa.toString().toLowerCase().includes(filterText.toLowerCase())) ||
          (item.tribunalRecord && item.tribunalRecord.toLowerCase().includes(filterText.toLowerCase())) ||
          (item.state && item.state.toLowerCase().includes(filterText.toLowerCase())) ||
          (item.defendants && item.defendants.some(defendant => 
            `${defendant.name} ${defendant.lastname}`.toLowerCase().includes(filterText.toLowerCase())
          ))
        );
      });
    }

    return filtered;
  };
  
  const filteredItems = useMemo(() => applyFilters(), [cases, filters, filterText]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
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
              {`${defendant.name} ${defendant.lastname}`}
            </div>
          ))}
        </div>
      ),
    },{
      name: 'Documento',
      cell: row => (
        <div>
          {row.defendants.map((defendant, index) => {
            const documentType = documentTypes.find(type => type.id === defendant.typeDocument);
            return (
              <div key={index}>
                {`${documentType ? documentType.type : 'N/A'}: ${defendant.document}`}
              </div>
            );
          })}
        </div>
      )
    },
    {
      name: 'Estado',
      cell: row => (
        <div>
          {row.defendants.map((defendant, index) => (
            <div key={index}>
              {`Estado: ${defendant.stablisment ? 'Detenido' : defendant.captureOrder ? 'Orden de captura' : 'Libre'}`}
            </div>
          ))}
        </div>
      )
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
  const fetchDocumentTypes = async () => {
    try {
      const response = await fetch('http://localhost:3300/common/doctype', {
        method: 'GET'
      });
      const data = await response.json();
      setDocumentTypes(data);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };

  const generateReport = (format) => {
    if (format === 'pdf') {
      generatePDFReport();
    } else if (format === 'excel') {
      generateExcelReport();
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Define brand colors
    const brandColors = {
      gold: '#B8860B',
      red: '#FF0000',
      darkGray: '#333333'
    };

    // Reuse the header and footer functions
    const addHeader = (doc) => {
      const logoWidth = 70;
      const logoHeight = 30;
      doc.addImage('/LOGO-DP-a-610px.png', 'PNG', 14, 10, logoWidth, logoHeight);
      
      
      doc.setTextColor(brandColors.darkGray);
      doc.setFontSize(10);
      doc.text([
        'Nueva Esparta, Sede Porlamar Nueva Esparta',
        'Av. 4 de Mayo, Edif. Torremayo, pb, Sector Genoves, Porlamar.',
        'Teléfonos: 0295-2632352',
        'Porlamar, Parroquia Capital Mariño, Municipio Mariño, Estado Nueva Esparta, 6301, Venezuela'
      ], 14, 45);

      doc.setDrawColor(brandColors.gold);
      doc.setLineWidth(0.5);
      doc.line(14, 65, 196, 65);
    };

    const addFooter = (doc) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(brandColors.darkGray);
      doc.text('Documento generado de acuerdo a los artículos 4 y 8 de la Ley sobre mensaje de Datos y Firmas electrónicas', 14, pageHeight - 10);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, pageHeight - 15);
      doc.text(`Página ${doc.internal.getCurrentPageInfo().pageNumber}`, 196, pageHeight - 10, { align: 'right' });
    };

    // Set up first page
    addHeader(doc);
    
    // Add document title
    doc.setFontSize(14);
    doc.setTextColor(brandColors.darkGray);
    doc.text('Reporte General de Casos', 14, 80);

    const tableData = filteredItems.map(c => [
      c.numberCausa,
      new Date(c.dateB).toLocaleDateString(),
      c.state,
      califications.find(cal => cal.id === c.calification)?.calificacion || 'N/A',
      c.defendants.map(d => getLibertyStatus(d)).join(', ')
    ]);

    doc.autoTable({
      startY: 90,
      head: [['Número de Causa', 'Fecha de Inicio', 'Estado', 'Calificación', 'Estado de Libertad']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        textColor: brandColors.darkGray,
      },
      headStyles: {
        fillColor: brandColors.gold,
        textColor: '#FFFFFF'
      },
      margin: { left: 14, right: 14 },
      didDrawPage: function(data) {
        addHeader(doc);
        addFooter(doc);
      }
    });

    // Add footer to the first page
    addFooter(doc);

    doc.save('reporte_casos.pdf');
  };

  const generateExcelReport = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Create a worksheet for the data
    const worksheet = XLSX.utils.json_to_sheet([]);
  
    // Add header information
    XLSX.utils.sheet_add_aoa(worksheet, [
      ['DEFENSA PÚBLICA'],
      [''],
      ['Nueva Esparta, Sede Porlamar Nueva Esparta'],
      ['Av. 4 de Mayo, Edif. Torremayo, pb, Sector Genoves, Porlamar.'],
      ['Teléfonos: 0295-2632352'],
      ['Porlamar, Parroquia Capital Mariño, Municipio Mariño, Estado Nueva Esparta, 6301, Venezuela'],
      [''],
      ['Reporte de Casos'],
      [''],
    ], { origin: 'A1' });
  
    // Add the case data
    const caseData = filteredItems.map(c => ({
      'Número de Causa': c.numberCausa,
      'Fecha de Inicio': new Date(c.dateB).toLocaleDateString(),
      'Estado': c.state,
      'Calificación': califications.find(cal => cal.id === c.calification)?.calificacion || 'N/A',
      'Estado de Libertad': c.defendants.map(d => getLibertyStatus(d)).join(', ')
    }));
    XLSX.utils.sheet_add_json(worksheet, caseData, { origin: 'A10', skipHeader: false });
  
    // Auto-size columns
    const max_width = filteredItems.reduce((w, r) => Math.max(w, r.numberCausa.length), 10);
    worksheet['!cols'] = [ { wch: max_width } ];
  
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Casos");
  
    // Write the Excel file
    XLSX.writeFile(workbook, "reporte_casos.xlsx");
  };

  const getLibertyStatus = (defendant) => {
    if (defendant.stablisment) {
      return 'Detenido';
    } else if (defendant.captureOrder) {
      return 'Orden de captura';
    } else {
      return 'Libre';
    }
  };

  const generatePDF = async (caseData) => {
    const doc = new jsPDF();
    
    // Define brand colors
    const brandColors = {
      gold: '#B8860B',
      red: '#FF0000',
      darkGray: '#333333'
    };

    // Add header to each page
    const addHeader = (doc) => {
      // Add logo
      const logoWidth = 70;
      const logoHeight = 30;
      doc.addImage('/LOGO-DP-a-610px.png', 'PNG', 14, 10, logoWidth, logoHeight);
    
      // Add office information
      doc.setTextColor(brandColors.darkGray);
      doc.setFontSize(10);
      doc.text([
        'Nueva Esparta, Sede Porlamar Nueva Esparta',
        'Av. 4 de Mayo, Edif. Torremayo, pb, Sector Genoves, Porlamar.',
        'Teléfonos: 0295-2632352',
        'Porlamar, Parroquia Capital Mariño, Municipio Mariño, Estado Nueva Esparta, 6301, Venezuela'
      ], 14, 45);

      // Add separator line
      doc.setDrawColor(brandColors.gold);
      doc.setLineWidth(0.5);
      doc.line(14, 65, 196, 65);
    };

    // Add footer to each page
    const addFooter = (doc) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(brandColors.darkGray);
      doc.text('Documento generado de acuerdo a los artículos 4 y 8 de la Ley sobre mensaje de Datos y Firmas electrónicas', 14, pageHeight - 10);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, pageHeight - 15);
      doc.text(`Página ${doc.internal.getCurrentPageInfo().pageNumber}`, 196, pageHeight - 10, { align: 'right' });
    };

    // Set up first page
    addHeader(doc);
    
    // Add document title
    doc.setFontSize(14);
    doc.setTextColor(brandColors.darkGray);
    doc.text(`Informe del Caso N° ${caseData.numberCausa}`, 14, 80);

    // Add case details
    const caseDetails = [
      ['Defensoría', def],
      ['Número de Causa', caseData.numberCausa],
      ['Tribunal', caseData.tribunalRecord],
      ['Fecha de Inicio', new Date(caseData.dateB).toLocaleDateString()],
      ['Fecha de Aceptación', new Date(caseData.dateA).toLocaleDateString()],
      ['Fiscalía', caseData.fiscalia],
      ['Estado', caseData.state],
    ];

    doc.autoTable({
      startY: 90,
      body: caseDetails,
      theme: 'grid',
      styles: {
        fontSize: 10,
        textColor: brandColors.darkGray,
      },
      headStyles: {
        fillColor: brandColors.gold,
        textColor: '#FFFFFF'
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: function(data) {
        addHeader(doc);
        addFooter(doc);
      }
    });

    // Add defendants section
    doc.setFontSize(12);
    doc.text('Información de Defendidos', 14, doc.lastAutoTable.finalY + 15);

    const defendantsData = caseData.defendants.map(d => [
      `${d.name} ${d.lastname}`,
      d.typeDocument,
      
      d.stablisment ? 'Detenido' : d.captureOrder ? 'Orden de captura' : 'Libre'
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Nombre', 'Tipo Doc.', 'Documento', 'Estado']],
      body: defendantsData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        textColor: brandColors.darkGray,
      },
      headStyles: {
        fillColor: brandColors.gold,
        textColor: '#FFFFFF'
      },
      margin: { left: 14, right: 14 },
      didDrawPage: function(data) {
        addHeader(doc);
        addFooter(doc);
      }
    });

    // Add proceedings section
    try {
      const response = await fetch('http://localhost:3300/actuaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: caseData.id })
      });
      const proceedings = await response.json();
      
      doc.setFontSize(12);
      doc.text('Actuaciones del Caso', 14, doc.lastAutoTable.finalY + 15);
      
      const proceedingsData = proceedings.map(p => [
        new Date(p.dateReport).toLocaleDateString(),
        p.actividad,
        p.resultado
      ]);

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Fecha', 'Actividad', 'Resultado']],
        body: proceedingsData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          textColor: brandColors.darkGray,
        },
        headStyles: {
          fillColor: brandColors.gold,
          textColor: '#FFFFFF'
        },
        margin: { left: 14, right: 14 },
        didDrawPage: function(data) {
          addHeader(doc);
          addFooter(doc);
        }
      });
    } catch (error) {
      console.error('Error fetching proceedings:', error);
    }

    // Add footer to the first page
    addFooter(doc);

    doc.save(`Caso_${caseData.numberCausa}.pdf`);
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: [null, null],
      status: '',
      calification: '',
      libertyStatus: '',
      defensoria: def
    });
    setFilterText('');
    setResetPaginationToggle(!resetPaginationToggle);
  };

  return (
    <div className="container-fluid">
      <h2 className="mt-4 mb-4 text-center text-light border-2 border-bottom border-warning">Inventario de Causas</h2>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-0 h-100">
            <div className="card-header text-white bg-primary">
              <h4 className="mb-0">Estado de Causas</h4>
            </div>
            <div className="card-body bg-light  bg-gradient bg-opacity-75">
              {Object.entries(statusStats).map(([status, count]) => (
                <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                  <span>{status}:</span>
                  <span className="badge bg-secondary">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-6 ">
          <div className="card border-0  h-100">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">Estado de Libertad de Defendidos</h4>
            </div>
            <div className="card-body bg-light  bg-gradient bg-opacity-75">
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

      <div className="row mb-4 p-2">
        <div className="col-md-2 p-2">
          <DatePicker
            selectsRange={true}
            startDate={filters.dateRange[0]}
            endDate={filters.dateRange[1]}
            onChange={(update) => handleFilterChange('dateRange', update)}
            className="form-control"
            placeholderText="Rango de fechas"
          />
        </div>
        <div className="col-md-2 p-2">
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Estado</option>
            <option value="Activa">Activa</option>
            <option value="Cerrada Administrativamente">Cerrada Administrativamente</option>
            <option value="Paralizada">Paralizada</option>
            <option value="Terminada">Terminada</option>
          </select>
        </div>
        <div className="col-md-2 p-2">
          <select
            className="form-select"
            value={filters.calification}
            onChange={(e) => handleFilterChange('calification', e.target.value)}
          >
            <option value="">Calificación</option>
            {califications.map((cal) => (
              <option key={cal.id} value={cal.id}>{cal.calificacion}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2 p-2">
          <select
            className="form-select"
            value={filters.libertyStatus}
            onChange={(e) => handleFilterChange('libertyStatus', e.target.value)}
          >
            <option value="">Estado de Libertad</option>
            <option value="Detenido">Detenido</option>
            <option value="Orden de captura">Orden de captura</option>
            <option value="Libre">Libre</option>
          </select>
        </div>
        <div className="col-md-3 p-2">
          <input
            type="text"
            placeholder="Buscar..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="col-md-1 p-2">
          <button className="btn btn-primary w-100" onClick={handleClearFilters}>Limpiar</button>
        </div>
        <div className="col-md-2 p-2">
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle w-100" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              Descargar Reporte
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li><a className="dropdown-item" href="#" onClick={() => generateReport('pdf')}>PDF</a></li>
              <li><a className="dropdown-item" href="#" onClick={() => generateReport('excel')}>Excel</a></li>
            </ul>
          </div>
        </div>
      </div>


      <div className="row">
        <div className="col-12">
          <DataTable
            columns={columns}
            data={filteredItems}
            pagination
            paginationResetDefaultPage={resetPaginationToggle}
            progressPending={loading}
            highlightOnHover
            pointerOnHover
            className="border"
            persistTableHead
          />
        </div>
      </div>
    </div>
  );
}

