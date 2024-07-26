// src/components/Dashboard.js

import React, { useEffect, useState } from 'react';
import { getGNBs, getCells, getUEs, getPaths, addGNB, editGNB, deleteGNB } from '../utils/api';
import {
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CCardTitle, CRow, CCol
} from '@coreui/react';
import GNBFormModal from './GNBFormModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const Dashboard = ({ token }) => {
  const [gnbs, setGnbs] = useState([]);
  const [cells, setCells] = useState([]);
  const [ues, setUEs] = useState([]);
  const [paths, setPaths] = useState([]);
  const [showGNBModal, setShowGNBModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentGNB, setCurrentGNB] = useState(null);
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
      <CRow className="mb-4">
        <CCol sm="3">
          <CCard>
            <CCardBody>
              <CCardTitle>gNBs</CCardTitle>
              <h4>{gnbs.length}</h4>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm="3">
          <CCard>
            <CCardBody>
              <CCardTitle>Cells</CCardTitle>
              <h4>{cells.length}</h4>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm="3">
          <CCard>
            <CCardBody>
              <CCardTitle>UEs</CCardTitle>
              <h4>{ues.length}</h4>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm="3">
          <CCard>
            <CCardBody>
              <CCardTitle>Paths</CCardTitle>
              <h4>{paths.length}</h4>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

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

      <GNBFormModal
        visible={showGNBModal}
        handleClose={() => setShowGNBModal(false)}
        handleSubmit={handleGNBSubmit}
        initialData={currentGNB}
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
