const checkStoredData = async () => {
    try {
      const allData = await window.electron.store.get();
      console.log('Stored Data:', allData);
    } catch (error) {
      console.error('Error retrieving stored data:', error);
    }
  };
  
export default checkStoredData
  