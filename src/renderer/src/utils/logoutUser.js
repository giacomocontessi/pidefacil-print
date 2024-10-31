const logoutUser = () => {
    // window.electron.store.delete('userInfo');
    // window.electron.store.delete('token');
    // window.electron.store.delete('refreshToken');
    window.electron.store.delete('user');
  
    // You might want to perform additional logout actions here
    // For example, redirecting the user back to the login screen
    window.location.reload(); // This will reload the app, prompting the user to log in again
  };
  
  export default logoutUser;
  