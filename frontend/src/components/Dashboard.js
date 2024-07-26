// src/components/Dashboard.js

import React, { useEffect, useState } from 'react';
import { getGNBs, getCells, getUEs, getPaths, addGNB, editGNB, deleteGNB } from '../utils/api';
import {
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CCardTitle
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

  const [currentGNB, setCurrentGNB] = useState(null);
  const [currentCell, setCurrentCell] = useState(null);
  const [currentUE, setCurrentUE] = useState(null);
  const [currentPath, setCurrentPath] = useState(null);

  const [gnbToDelete, setGNBToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gnbsData = await getGNBs(token);
        setGnbs(gnbsData);
        const cellsData = await getCells(token);
        setCells(cellsData);
        const uesData = await getUEs(token);
        setUEs(uesData);
        const pathsData = await getPaths(token);
        setPaths(pathsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  const handleAddGNB = () => {
    setCurrentGNB(null);
    setShowGNBModal(true);
  };

  const handleEditGNB = (gnb) => {
    setCurrentGNB(gnb);
    setShowGNBModal(true);
  };

  const handleDeleteGNB = (gnbId) => {
    setGNBToDelete(gnbId);
    setShowDeleteModal(true);
  };

  const confirmDeleteGNB = async () => {
    try {
      await deleteGNB(token, gnbToDelete);
      setGnbs(gnbs.filter(gnb => gnb.id !== gnbToDelete));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting gNB:', error);
    }
  };

  const handleGNBSubmit = async (gnb) => {
    try {
      if (gnb.id) {
        const updatedGNB = await editGNB(token, gnb);
        setGnbs(gnbs.map(item => (item.id === updatedGNB.id ? updatedGNB : item)));
      } else {
        const newGNB = await addGNB(token, gnb);
        setGnbs([...gnbs, newGNB]);
      }
      setShowGNBModal(false);
    } catch (error) {
      console.error('Error submitting gNB:', error);
    }
  };

  return (
    <>
      <CCard>
        <CCardHeader>
          <CCardTitle>
            gNBs
            <CButton color="success" className="float-right" onClick={handleAddGNB}>+</CButton>
          </CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>id</CTableHeaderCell>
                <CTableHeaderCell>gNB_id</CTableHeaderCell>
                <CTableHeaderCell>name</CTableHeaderCell>
                <CTableHeaderCell>description</CTableHeaderCell>
                <CTableHeaderCell>location</CTableHeaderCell>
                <CTableHeaderCell>actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {gnbs.map((gnb) => (
                <CTableRow key={gnb.id}>
                  <CTableDataCell>{gnb.id}</CTableDataCell>
                  <CTableDataCell>{gnb.gNB_id}</CTableDataCell>
                  <CTableDataCell>{gnb.name}</CTableDataCell>
                  <CTableDataCell>{gnb.description}</CTableDataCell>
                  <CTableDataCell>{gnb.location}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="info" onClick={() => handleEditGNB(gnb)}>Edit</CButton>
                    <CButton color="danger" onClick={() => handleDeleteGNB(gnb.id)}>Delete</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader>
          <CCardTitle>Cells</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>id</CTableHeaderCell>
                <CTableHeaderCell>cell_id</CTableHeaderCell>
                <CTableHeaderCell>name</CTableHeaderCell>
                <CTableHeaderCell>description</CTableHeaderCell>
                <CTableHeaderCell>gnb</CTableHeaderCell>
                <CTableHeaderCell>actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {cells.map((cell) => (
                <CTableRow key={cell.id}>
                  <CTableDataCell>{cell.id}</CTableDataCell>
                  <CTableDataCell>{cell.cell_id}</CTableDataCell>
                  <CTableDataCell>{cell.name}</CTableDataCell>
                  <CTableDataCell>{cell.description}</CTableDataCell>
                  <CTableDataCell>{cell.gnb}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="info" onClick={() => setCurrentCell(cell)}>Edit</CButton>
                    <CButton color="danger" onClick={() => setCurrentCell(cell.id)}>Delete</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader>
          <CCardTitle>UEs</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>supi</CTableHeaderCell>
                <CTableHeaderCell>name</CTableHeaderCell>
                <CTableHeaderCell>ext.identifier</CTableHeaderCell>
                <CTableHeaderCell>Cell_id</CTableHeaderCell>
                <CTableHeaderCell>ip_address_v4</CTableHeaderCell>
                <CTableHeaderCell>path_id</CTableHeaderCell>
                <CTableHeaderCell>speed</CTableHeaderCell>
                <CTableHeaderCell>actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {ues.map((ue) => (
                <CTableRow key={ue.supi}>
                  <CTableDataCell>{ue.supi}</CTableDataCell>
                  <CTableDataCell>{ue.name}</CTableDataCell>
                  <CTableDataCell>{ue['ext.identifier']}</CTableDataCell>
                  <CTableDataCell>{ue.cell_id}</CTableDataCell>
                  <CTableDataCell>{ue.ip_address_v4}</CTableDataCell>
                  <CTableDataCell>{ue.path_id}</CTableDataCell>
                  <CTableDataCell>{ue.speed}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="info" onClick={() => setCurrentUE(ue)}>Edit</CButton>
                    <CButton color="danger" onClick={() => setCurrentUE(ue.supi)}>Delete</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader>
          <CCardTitle>Paths</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>id</CTableHeaderCell>
                <CTableHeaderCell>description</CTableHeaderCell>
                <CTableHeaderCell>color</CTableHeaderCell>
                <CTableHeaderCell>actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paths.map((path) => (
                <CTableRow key={path.id}>
                  <CTableDataCell>{path.id}</CTableDataCell>
                  <CTableDataCell>{path.description}</CTableDataCell>
                  <CTableDataCell>{path.color}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="info" onClick={() => setCurrentPath(path)}>Edit</CButton>
                    <CButton color="danger" onClick={() => setCurrentPath(path.id)}>Delete</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <GNBFormModal
        visible={showGNBModal}
        handleClose={() => setShowGNBModal(false)}
        handleSubmit={handleGNBSubmit}
        initialData={currentGNB}
      />

      <CellFormModal
        visible={showCellModal}
        handleClose={() => setShowCellModal(false)}
        handleSubmit={handleGNBSubmit}
        initialData={currentCell}
      />

      <UEFormModal
        visible={showUEModal}
        handleClose={() => setShowUEModal(false)}
        handleSubmit={handleGNBSubmit}
        initialData={currentUE}
      />

      <PathFormModal
        visible={showPathModal}
        handleClose={() => setShowPathModal(false)}
        handleSubmit={handleGNBSubmit}
        initialData={currentPath}
      />

      <DeleteConfirmationModal
        visible={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        handleDelete={confirmDeleteGNB}
      />
    </>
  );
};

export default Dashboard;
