// dashboardFunctions.js
import {
    getGNBs, getCells, getUEs, getPaths, addGNB, editGNB, deleteGNB, addCell, editCell,
    deleteCell, addUE, editUE, deleteUE, addPath, editPath, deletePath
  } from '../utils/api';
  
  export const fetchData = async (token, setGnbs, setCells, setUEs, setPaths) => {
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
  
  export const handleAdd = (type, setCurrentEntity, setEntityType, setShowGNBModal, setShowCellModal, setShowUEModal, setShowPathModal) => {
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
  
  export const handleEdit = (type, entity, setCurrentEntity, setEntityType, setShowGNBModal, setShowCellModal, setShowUEModal, setShowPathModal) => {
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
  
  export const handleDelete = (type, entity, setEntityToDelete, setShowDeleteModal) => {
    let id;
  
    switch (type) {
      case 'GNB':
        id = entity.gNB_id;
        break;
      case 'Cell':
        id = entity.cell_id;
        break;
      case 'UE':
        id = entity.supi;
        break;
      case 'Path':
        id = entity.id;
        break;
      default:
        console.error('Invalid entity type');
        return; 
    }
  
    setEntityToDelete({ type, id });
    setShowDeleteModal(true);
  };
  
  export const confirmDelete = async (token, entityToDelete, setGnbs, setCells, setUEs, setPaths, setShowDeleteModal) => {
    try {
      const { type, id } = entityToDelete;
      switch(type) {
        case 'GNB':
          await deleteGNB(token, id);
          setGnbs(prevGnbs => prevGnbs.filter(gnb => gnb.gNB_id !== id));
          break;
        case 'Cell':
          await deleteCell(token, id);
          setCells(prevCells => prevCells.filter(cell => cell.cell_id !== id));
          break;
        case 'UE':
          await deleteUE(token, id);
          setUEs(prevUEs => prevUEs.filter(ue => ue.supi !== id));
          break;
        case 'Path':
          await deletePath(token, id);
          setPaths(prevPaths => prevPaths.filter(path => path.id !== id));
          break;
        default:
          break;
      }
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };
  
  export const handleSubmit = async (entity, entityType, token, setGnbs, setCells, setUEs, setPaths, closeModals) => {
    try {
      let id;
      let data = { ...entity };
  
      // Extract id based on entityType
      switch (entityType) {
        case 'GNB':
          id = entity.gNB_id;
          break;
        case 'Cell':
          id = entity.cell_id;
          break;
        case 'UE':
          id = entity.supi;
          break;
        case 'Path':
          id = entity.id;
          break;
        default:
          throw new Error('Invalid entity type');
      }
  
      if (id) {
        // Editing entity
        switch (entityType) {
          case 'GNB':
            await editGNB(token, data);
            setGnbs(prevGnbs => prevGnbs.map(item => item.gNB_id === id ? data : item));
            break;
          case 'Cell':
            await editCell(token, data);
            setCells(prevCells => prevCells.map(item => item.cell_id === id ? data : item));
            break;
          case 'UE':
            await editUE(token, data);
            setUEs(prevUEs => prevUEs.map(item => item.supi === id ? data : item));
            break;
          case 'Path':
            await editPath(token, data);
            setPaths(prevPaths => prevPaths.map(item => item.id === id ? data : item));
            break;
          default:
            throw new Error('Invalid entity type');
        }
      } else {
        // Adding new entity
        // Remove the id from data
        switch (entityType) {
          case 'GNB':
            delete data.gNB_id;
            const newGNB = await addGNB(token, data);
            setGnbs(prevGnbs => [...prevGnbs, newGNB]);
            break;
          case 'Cell':
            delete data.cell_id;
            const newCell = await addCell(token, data);
            setCells(prevCells => [...prevCells, newCell]);
            break;
          case 'UE':
            delete data.supi;
            const newUE = await addUE(token, data);
            setUEs(prevUEs => [...prevUEs, newUE]);
            break;
          case 'Path':
            delete data.id;
            const newPath = await addPath(token, data);
            setPaths(prevPaths => [...prevPaths, newPath]);
            break;
          default:
            throw new Error('Invalid entity type');
        }
      }
  
      closeModals();
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };
  
  
  
  
  