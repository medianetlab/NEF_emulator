import React, { useEffect, useState } from 'react';
import { getGNBs, getCells, getUEs, getPaths } from '../utils/api';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CCardTitle
} from '@coreui/react';

const Dashboard = ({ token }) => {
  const [gnbs, setGnbs] = useState([]);
  const [cells, setCells] = useState([]);
  const [ues, setUes] = useState([]);
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gnbsData = await getGNBs(token);
        //const removeGnb = await deleteGNB(token, gnb_id)
        const cellsData = await getCells(token);
        const uesData = await getUEs(token);
        const pathsData = await getPaths(token);

        setGnbs(gnbsData);
        setCells(cellsData);
        setUes(uesData);
        setPaths(pathsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  return (
    <>
      <CCard>
        <CCardHeader>
          <CCardTitle>gNBs <CButton color="success" className="float-right">+</CButton></CCardTitle>
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
                    <CButton color="info">Edit</CButton>{' '}
                    <CButton color="danger">Delete</CButton>{}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>



      <CCard>
        <CCardHeader>
          <CCardTitle>Cells <CButton color="success" className="float-right">+</CButton></CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>id</CTableHeaderCell>
                <CTableHeaderCell>cell_id</CTableHeaderCell>
                <CTableHeaderCell>name</CTableHeaderCell>
                <CTableHeaderCell>description</CTableHeaderCell>
                <CTableHeaderCell>gNB_id</CTableHeaderCell>
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
                  <CTableDataCell>{cell.gNB_id}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="info">Edit</CButton>{' '}
                    <CButton color="danger">Delete</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>


      <CCard>
        <CCardHeader>
          <CCardTitle>Paths <CButton color="success" className="float-right">+</CButton></CCardTitle>
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
                    <CButton color="info">Edit</CButton>{' '}
                    <CButton color="danger">Delete</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  );
};

export default Dashboard;

