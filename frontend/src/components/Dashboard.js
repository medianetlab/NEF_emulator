import React, { useEffect, useState } from 'react';
import {
  getGNBs, getCells, getUEs, getPaths, addGNB, editGNB, deleteGNB, addCell, editCell,
  deleteCell, addUE, editUE, deleteUE, addPath, editPath, deletePath
} from '../utils/api';
import {
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CCardTitle, CRow, CCol
} from '@coreui/react';
import GNBFormModal from './GNBFormModal';
import CellFormModal from './CellFormModal';
import UEFormModal from './UEFormModal';
import PathFormModal from './PathFormModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

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
    const fetchData = async () => {
      try {
        const [gnbsData, cellsData, uesData, pathsData] = await Promise.all([
          getGNBs(token),
          getCells(token),
          getUEs(token),
          getPaths(token),
        ]);
        setGnbs(gnbsData);
        setCells(cellsData);
        setUEs(uesData);
        setPaths(pathsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  const handleAdd = (type) => {
    setCurrentEntity(null);
    setEntityType(type);
    switch(type) {
      case 'GNB':
        setShowGNBModal(true);
        break;
      case 'Cell':
        setShowCellModal(true);
        break;
      case 'UE':
        setShowUEModal(true);
        break;
      case 'Path':
        setShowPathModal(true);
        break;
      default:
        break;
    }
  };

  const handleEdit = (type, entity) => {
    setCurrentEntity(entity);
    setEntityType(type);
    switch(type) {
      case 'GNB':
        setShowGNBModal(true);
        break;
      case 'Cell':
        setShowCellModal(true);
        break;
      case 'UE':
        setShowUEModal(true);
        break;
      case 'Path':
        setShowPathModal(true);
        break;
      default:
        break;
    }
  };

  const handleDelete = (type, entity) => {
    setEntityToDelete({ type, id: entity.id });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const { type, id } = entityToDelete;
      switch(type) {
        case 'GNB':
          await deleteGNB(token, id);
          setGnbs(gnbs.filter(gnb => gnb.id !== id));
          break;
        case 'Cell':
          await deleteCell(token, id);
          setCells(cells.filter(cell => cell.id !== id));
          break;
        case 'UE':
          await deleteUE(token, id);
          setUEs(ues.filter(ue => ue.supi !== id));
          break;
        case 'Path':
          await deletePath(token, id);
          setPaths(paths.filter(path => path.id !== id));
          break;
        default:
          break;
      }
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleSubmit = async (entity) => {
    try {
      switch(entityType) {
        case 'GNB':
          if (entity.id) {
            const updatedGNB = await editGNB(token, entity);
            setGnbs(gnbs.map(item => item.id === updatedGNB.id ? updatedGNB : item));
          } else {
            const newGNB = await addGNB(token, entity);
            setGnbs([...gnbs, newGNB]);
          }
          setShowGNBModal(false);
          break;
        case 'Cell':
          if (entity.id) {
            const updatedCell = await editCell(token, entity);
            setCells(cells.map(item => item.id === updatedCell.id ? updatedCell : item));
          } else {
            const newCell = await addCell(token, entity);
            setCells([...cells, newCell]);
          }
          setShowCellModal(false);
          break;
        case 'UE':
          if (entity.supi) {
            const updatedUE = await editUE(token, entity);
            setUEs(ues.map(item => item.supi === updatedUE.supi ? updatedUE : item));
          } else {
            const newUE = await addUE(token, entity);
            setUEs([...ues, newUE]);
          }
          setShowUEModal(false);
          break;
        case 'Path':
          if (entity.id) {
            const updatedPath = await editPath(token, entity);
            setPaths(paths.map(item => item.id === updatedPath.id ? updatedPath : item));
          } else {
            const newPath = await addPath(token, entity);
            setPaths([...paths, newPath]);
          }
          setShowPathModal(false);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error submitting:', error);
    }
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
        onAdd={() => handleAdd('GNB')}
        onEdit={entity => handleEdit('GNB', entity)}
        onDelete={entity => handleDelete('GNB', entity)}
      />
      <DataTable 
        title="Cells"
        data={cells}
        columns={cellColumns}
        onAdd={() => handleAdd('Cell')}
        onEdit={entity => handleEdit('Cell', entity)}
        onDelete={entity => handleDelete('Cell', entity)}
      />
      <DataTable 
        title="UEs"
        data={ues}
        columns={ueColumns}
        onAdd={() => handleAdd('UE')}
        onEdit={entity => handleEdit('UE', entity)}
        onDelete={entity => handleDelete('UE', entity)}
      />
      <DataTable 
        title="Paths"
        data={paths}
        columns={pathColumns}
        onAdd={() => handleAdd('Path')}
        onEdit={entity => handleEdit('Path', entity)}
        onDelete={entity => handleDelete('Path', entity)}
      />

      <GNBFormModal
        visible={showGNBModal}
        handleClose={() => setShowGNBModal(false)}
        handleSubmit={handleSubmit}
        initialData={currentEntity}
      />

      <CellFormModal
        visible={showCellModal}
        handleClose={() => setShowCellModal(false)}
        handleSubmit={handleSubmit}
        initialData={currentEntity}
      />

      <UEFormModal
        visible={showUEModal}
        handleClose={() => setShowUEModal(false)}
        handleSubmit={handleSubmit}
        initialData={currentEntity}
      />

      <PathFormModal
        visible={showPathModal}
        handleClose={() => setShowPathModal(false)}
        handleSubmit={handleSubmit}
        initialData={currentEntity}
      />

      <DeleteConfirmationModal
        visible={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        handleDelete={confirmDelete}
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
