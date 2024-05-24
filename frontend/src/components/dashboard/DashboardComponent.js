import React from 'react';
import { CCard, CCardBody, CCardTitle, CCardText, CRow, CCol } from '@coreui/react';
import './DashboardComponent.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <CRow>
        <CCol sm="6" lg="3">
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle>gNBs</CCardTitle>
              <CCardText>1</CCardText>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm="6" lg="3">
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle>Cells</CCardTitle>
              <CCardText>4</CCardText>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm="6" lg="3">
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle>UEs</CCardTitle>
              <CCardText>3</CCardText>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm="6" lg="3">
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle>Paths</CCardTitle>
              <CCardText>2</CCardText>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle>gNBs</CCardTitle>
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>id</th>
                    <th>gNB_id</th>
                    <th>name</th>
                    <th>description</th>
                    <th>location</th>
                    <th>actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>AAAAA1</td>
                    <td>gNB1</td>
                    <td>This is a base station</td>
                    <td>unknown</td>
                    <td>
                      <button className="btn btn-sm btn-danger">Delete</button>
                      <button className="btn btn-sm btn-warning">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle>Cells</CCardTitle>
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>id</th>
                    <th>cell_id</th>
                    <th>name</th>
                    <th>description</th>
                    <th>gNB_id</th>
                    <th>actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>AAAAA1001</td>
                    <td>cell1</td>
                    <td>Administration Building</td>
                    <td>AAAAA1</td>
                    <td>
                      <button className="btn btn-sm btn-danger">Delete</button>
                      <button className="btn btn-sm btn-warning">Edit</button>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>AAAAA1002</td>
                    <td>cell2</td>
                    <td>Institute of Radioisotopes and Radiodiagnostic Products</td>
                    <td>AAAAA1</td>
                    <td>
                      <button className="btn btn-sm btn-danger">Delete</button>
                      <button className="btn btn-sm btn-warning">Edit</button>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>AAAAA1003</td>
                    <td>cell3</td>
                    <td>Institute of Informatics and Telecommunications</td>
                    <td>AAAAA1</td>
                    <td>
                      <button className="btn btn-sm btn-danger">Delete</button>
                      <button className="btn btn-sm btn-warning">Edit</button>
                    </td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>AAAAA1004</td>
                    <td>cell4</td>
                    <td>Faculty Building</td>
                    <td>AAAAA1</td>
                    <td>
                      <button className="btn btn-sm btn-danger">Delete</button>
                      <button className="btn btn-sm btn-warning">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle>UEs</CCardTitle>
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>supi</th>
                    <th>name</th>
                    <th>ext. identifier</th>
                    <th>Cell_Id</th>
                    <th>ip_address_v4</th>
                    <th>path_id</th>
                    <th>speed</th>
                    <th>actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>202010000000001</td>
                    <td>UE1</td>
                    <td>10001@domain.com</td>
                    <td>-</td>
                    <td>10.0.0.1</td>
                    <td>2</td>
                    <td>LOW</td>
                    <td>
                      <button className="btn btn-sm btn-danger">Delete</button>
                      <button className="btn btn-sm btn-warning">Edit</button>
                    </td>
                  </tr>
                  <tr>
                    <td>202010000000002</td>
                    <td>UE2</td>
                    <td>10002@domain.com</td>
                    <td>-</td>
                    <td>10.0.0.2</td>
                    <td>2</td>
                    <td>LOW</td>
                    <td>
                      <button className="btn btn-sm btn-danger">Delete</button>
                      <button className="btn btn-sm btn-warning">Edit</button>
                    </td>
                  </tr>
                  <tr>
                    <td>202010000000003</td>
                    <td>UE3</td>
                    <td>10003@domain.com</td>
                    <td>10003</td>
                    <td>10.0.0.3</td>
                    <td>3</td>
                    <td>HIGH</td>
                    <td>
                      <button className="btn btn-sm btn-danger">Delete</button>
                      <button className="btn btn-sm btn-warning">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default Dashboard;
