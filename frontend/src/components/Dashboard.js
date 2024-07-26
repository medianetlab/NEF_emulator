import React, { useEffect, useState } from 'react';
import {
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CCardTitle, CRow, CCol
} from '@coreui/react';
import GNBFormModal from './GNBFormModal';
import CellFormModal from './CellFormModal';
import UEFormModal from './UEFormModal';
import PathFormModal from './PathFormModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import {
  fetchData, handleAdd, handleEdit, handleDelete, confirmDelete, handleSubmit
} from './DashboardUtils';

const Dashboard = ({ token }) => {
  const [gnbs, setGnbs] = useState([]);
  const [cells, setCells] = useState([]);
  const [ues, setUEs] = useState([]);
  const [paths, setPaths] = useState([]);

  const [showGNBModal, setShowGNBModal] = useState(false);
  const [showCellModal, setShowCellModal] = useState(false);
  const [showUEModal, setShowUEModal] = useState(false);
  const [showPathModal, setShowPathModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentEntity, setCurrentEntity] = useState(null);
  const [entityType, setEntityType] = useState('');
  const [entityToDelete, setEntityToDelete] = useState(null);

  useEffect(() => {
    fetchData(token, setGnbs, setCells, setUEs, setPaths);
  }, [token]);

  const closeModals = () => {
    setShowGNBModal(false);
    setShowCellModal(false);
    setShowUEModal(false);
    setShowPathModal(false);
    setShowDeleteModal(false);
  };


  const gNBColumns = [
    { header: 'id', accessor: item => item.id },
    { header: 'gNB_id', accessor: item => item.gNB_id },
    { header: 'name', accessor: item => item.name },
    { header: 'description', accessor: item => item.description },
    { header: 'location', accessor: item => item.location }
  ];

  const cellColumns = [
    { header: 'id', accessor: item => item.id },
    { header: 'cell_id', accessor: item => item.cell_id },
    { header: 'name', accessor: item => item.name },
    { header: 'description', accessor: item => item.description },
    { header: 'gnb', accessor: item => item.gnb }
  ];

  const ueColumns = [
    { header: 'supi', accessor: item => item.supi },
    { header: 'name', accessor: item => item.name },
    { header: 'ext.identifier', accessor: item => item['ext.identifier'] },
    { header: 'Cell_id', accessor: item => item.cell_id },
    { header: 'ip_address_v4', accessor: item => item.ip_address_v4 },
    { header: 'path_id', accessor: item => item.path_id },
    { header: 'speed', accessor: item => item.speed }
  ];

  const pathColumns = [
    { header: 'id', accessor: item => item.id },
    { header: 'description', accessor: item => item.description },
    { header: 'color', accessor: item => item.color }
  ];

  return (
    <>
      <CRow className="mb-4">
        <CCol md="3">
          <CCard>
            <CCardHeader>
              <CCardTitle>gNBs</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <h2>{gnbs.length}</h2>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md="3">
          <CCard>
            <CCardHeader>
              <CCardTitle>Cells</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <h2>{cells.length}</h2>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md="3">
          <CCard>
            <CCardHeader>
              <CCardTitle>UEs</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <h2>{ues.length}</h2>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md="3">
          <CCard>
            <CCardHeader>
              <CCardTitle>Paths</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <h2>{paths.length}</h2>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <DataTable 
        title="gNBs"
        data={gnbs}
        columns={gNBColumns}
        onAdd={() => handleAdd('GNB', setCurrentEntity, setEntityType, setShowGNBModal, setShowCellModal, setShowUEModal, setShowPathModal)}
        onEdit={entity => handleEdit('GNB', entity, setCurrentEntity, setEntityType, setShowGNBModal, setShowCellModal, setShowUEModal, setShowPathModal)}
        onDelete={entity => handleDelete('GNB', entity, setEntityToDelete, setShowDeleteModal)}
      />
      <DataTable 
        title="Cells"
        data={cells}
        columns={cellColumns}
        onAdd={() => handleAdd('Cell', setCurrentEntity, setEntityType, setShowGNBModal, setShowCellModal, setShowUEModal, setShowPathModal)}
        onEdit={entity => handleEdit('Cell', entity, setCurrentEntity, setEntityType, setShowGNBModal, setShowCellModal, setShowUEModal, setShowPathModal)}
        onDelete={entity => handleDelete('Cell', entity, setEntityToDelete, setShowDeleteModal)}
      />
      <DataTable 
        title="UEs"
        data={ues}
        columns={ueColumns}
        onAdd={() => handleAdd('UE', setCurrentEntity, setEntityType, setShowGNBModal, setShowCellModal, setShowUEModal, setShowPathModal)}
        onEdit={entity => handleEdit('UE', entity, setCurrentEntity, setEntityType, setShowGNBModal, setShowCellModal, setShowUEModal, setShowPathModal)}
        onDelete={entity => handleDelete('UE', entity, setEntityToDelete, setShowDeleteModal)}
      />
      <DataTable 
        title="Paths"
        data={paths}
        columns={pathColumns}
        onAdd={() => handleAdd('Path', setCurrentEntity, setEntityType, setShowGNBModal, setShowCellModal, setShowUEModal, setShowPathModal)}
        onEdit={entity => handleEdit('Path', entity, setCurrentEntity, setEntityType, setShowGNBModal, setShowCellModal, setShowUEModal, setShowPathModal)}
        onDelete={entity => handleDelete('Path', entity, setEntityToDelete, setShowDeleteModal)}
      />

      <GNBFormModal
        visible={showGNBModal}
        handleClose={() => setShowGNBModal(false)}
        handleSubmit={entity => handleSubmit(entity, 'GNB', token, setGnbs, setCells, setUEs, setPaths, closeModals)}
        initialData={currentEntity}
      />

      <CellFormModal
        visible={showCellModal}
        handleClose={() => setShowCellModal(false)}
        handleSubmit={entity => handleSubmit(entity, 'Cell', token, setGnbs, setCells, setUEs, setPaths, closeModals)}
        initialData={currentEntity}
      />

      <UEFormModal
        visible={showUEModal}
        handleClose={() => setShowUEModal(false)}
        handleSubmit={entity => handleSubmit(entity, 'UE', token, setGnbs, setCells, setUEs, setPaths, closeModals)}
        initialData={currentEntity}
      />

      <PathFormModal
        visible={showPathModal}
        handleClose={() => setShowPathModal(false)}
        handleSubmit={entity => handleSubmit(entity, 'Path', token, setGnbs, setCells, setUEs, setPaths, closeModals)}
        initialData={currentEntity}
      />

      <DeleteConfirmationModal
        visible={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        handleDelete={() => confirmDelete(token, entityToDelete, setGnbs, setCells, setUEs, setPaths, setShowDeleteModal)}
      />
    </>
  );
};

const DataTable = ({ title, data, columns, onAdd, onEdit, onDelete }) => (
  <CCard>
    <CCardHeader>
      <CCardTitle>
        {title}
        <CButton color="success" className="float-right" onClick={onAdd}>+</CButton>
      </CCardTitle>
    </CCardHeader>
    <CCardBody>
      <CTable hover>
        <CTableHead>
          <CTableRow>
            {columns.map((col, index) => (
              <CTableHeaderCell key={index}>{col.header}</CTableHeaderCell>
            ))}
            <CTableHeaderCell>actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {data.map((item) => (
            <CTableRow key={item.id}>
              {columns.map((col, index) => (
                <CTableDataCell key={index}>{col.accessor(item)}</CTableDataCell>
              ))}
              <CTableDataCell>
                <CButton color="info" onClick={() => onEdit(item)}>Edit</CButton>
                <CButton color="danger" onClick={() => onDelete(item)}>Delete</CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </CCardBody>
  </CCard>
);

export default Dashboard;
