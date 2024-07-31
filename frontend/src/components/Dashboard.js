import React, { useEffect, useState } from 'react';
import {
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CCardTitle, CRow, CCol
} from '@coreui/react';
import AddGNBModal from './modals/AddGNBModal';
import EditGNBModal from './modals/EditGNBModal';
import AddCellModal from './modals/AddCellModal';
import EditCellModal from './modals/EditCellModal';
import AddUEsModal from './modals/AddUEModal';
import EditUEsModal from './modals/EditUEModal';
import AddPathModal from './modals/AddPathModal';
import EditPathModal from './modals/EditPathModal';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import {
  fetchData, handleAdd, handleEdit, handleDelete, confirmDelete,
  handleAddEntity, handleEditEntity
} from './DashboardUtils';

const Dashboard = ({ token }) => {
  const [gnbs, setGnbs] = useState([]);
  const [cells, setCells] = useState([]);
  const [ues, setUEs] = useState([]);
  const [paths, setPaths] = useState([]);

  const [showAddGNBModal, setShowAddGNBModal] = useState(false);
  const [showEditGNBModal, setShowEditGNBModal] = useState(false);
  const [showAddCellModal, setShowAddCellModal] = useState(false);
  const [showEditCellModal, setShowEditCellModal] = useState(false);
  const [showAddUEModal, setShowAddUEModal] = useState(false);
  const [showEditUEModal, setShowEditUEModal] = useState(false);
  const [showAddPathModal, setShowAddPathModal] = useState(false);
  const [showEditPathModal, setShowEditPathModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentEntity, setCurrentEntity] = useState(null);
  const [entityType, setEntityType] = useState('');
  const [entityToDelete, setEntityToDelete] = useState(null);

  useEffect(() => {
    fetchData(token, setGnbs, setCells, setUEs, setPaths);
  }, [token]);

  const closeModals = () => {
    setShowAddGNBModal(false);
    setShowEditGNBModal(false);
    setShowAddCellModal(false);
    setShowEditCellModal(false);
    setShowAddUEModal(false);
    setShowEditUEModal(false);
    setShowAddPathModal(false);
    setShowEditPathModal(false);
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
    { header: 'ext_identifier', accessor: item => item.ext_identifier },
    { header: 'cell_id', accessor: item => item.cell_id },
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
        onAdd={() => handleAdd('GNB', setCurrentEntity, setEntityType, setShowAddGNBModal, setShowAddCellModal, setShowAddUEModal, setShowAddPathModal)}
        onEdit={entity => handleEdit('GNB', entity, setCurrentEntity, setEntityType, setShowEditGNBModal, setShowEditCellModal, setShowEditUEModal, setShowEditPathModal)}
        onDelete={entity => handleDelete('GNB', entity, setEntityToDelete, setShowDeleteModal)}
      />
      <DataTable 
        title="Cells"
        data={cells}
        columns={cellColumns}
        onAdd={() => handleAdd('Cell', setCurrentEntity, setEntityType, setShowAddGNBModal, setShowAddCellModal, setShowAddUEModal, setShowAddPathModal)}
        onEdit={entity => handleEdit('Cell', entity, setCurrentEntity, setEntityType, setShowEditGNBModal, setShowEditCellModal, setShowEditUEModal, setShowEditPathModal)}
        onDelete={entity => handleDelete('Cell', entity, setEntityToDelete, setShowDeleteModal)}
      />
      <DataTable
        title="UEs"
        data={ues}
        columns={ueColumns}
        onAdd={() => handleAdd('UE', setCurrentEntity, setEntityType, setShowAddGNBModal, setShowAddCellModal, setShowAddUEModal, setShowAddPathModal)}
        onEdit={entity => handleEdit('UE', entity, setCurrentEntity, setEntityType, setShowEditGNBModal, setShowEditCellModal, setShowEditUEModal, setShowEditPathModal)}
        onDelete={entity => handleDelete('UE', entity, setEntityToDelete, setShowDeleteModal)}
      />
      <DataTable 
        title="Paths"
        data={paths}
        columns={pathColumns}
        onAdd={() => handleAdd('Path', setCurrentEntity, setEntityType, setShowAddGNBModal, setShowAddCellModal, setShowAddUEModal, setShowAddPathModal)}
        onEdit={entity => handleEdit('Path', entity, setCurrentEntity, setEntityType, setShowEditGNBModal, setShowEditCellModal, setShowEditUEModal, setShowEditPathModal)}
        onDelete={entity => handleDelete('Path', entity, setEntityToDelete, setShowDeleteModal)}
      />

      <AddGNBModal
        visible={showAddGNBModal}
        handleClose={() => setShowAddGNBModal(false)}
        handleSubmit={entity => handleAddEntity(entity, 'GNB', token, setGnbs, setCells, setUEs, setPaths, closeModals)}
        token={token}
      />

      <EditGNBModal
        visible={showEditGNBModal}
        handleClose={() => setShowEditGNBModal(false)}
        handleSubmit={entity => handleEditEntity(entity, 'GNB', token, setGnbs, setCells, setUEs, setPaths, closeModals)}
        initialData={currentEntity}
        token={token}
      />

      <AddCellModal
        visible={showAddCellModal}
        handleClose={() => setShowAddCellModal(false)}
        handleSubmit={entity => handleAddEntity(entity, 'Cell', token, setGnbs, setCells, setUEs, setPaths, closeModals)}
        token={token}
      />

      <EditCellModal
        visible={showEditCellModal}
        handleClose={() => setShowEditCellModal(false)}
        handleSubmit={entity => handleEditEntity(entity, 'Cell', token, setGnbs, setCells, setUEs, setPaths, closeModals)}
        initialData={currentEntity}
        token={token}
      />

      <AddUEsModal
        visible={showAddUEModal}
        handleClose={() => setShowAddUEModal(false)}
        handleSubmit={entity => handleAddEntity(entity, 'UE', token, setGnbs, setCells, setUEs, setPaths, closeModals)}
        token={token}
      />

      <EditUEsModal
        visible={showEditUEModal}
        handleClose={() => setShowEditUEModal(false)}
        handleSubmit={entity => handleEditEntity(entity, 'UE', token, setGnbs, setCells, setUEs, setPaths, closeModals)}
        initialData={currentEntity}
        token={token}
      />

      <AddPathModal
        visible={showAddPathModal}
        handleClose={() => setShowAddPathModal(false)}
        handleSubmit={entity => handleAddEntity(entity, 'Path', token, setGnbs, setCells, setUEs, setPaths, closeModals)}
        token={token}
      />

      <EditPathModal
        visible={showEditPathModal}
        handleClose={() => setShowEditPathModal(false)}
        handleSubmit={entity => handleEditEntity(entity, 'Path', token, setGnbs, setCells, setUEs, setPaths, closeModals)}
        initialData={currentEntity}
        token={token}
      />

      <ConfirmDeleteModal
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
            <CTableHeaderCell>Actions</CTableHeaderCell>
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
