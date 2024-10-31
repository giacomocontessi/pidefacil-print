const getUser = async () => {
    try {
      console.log('Fetching user data from electron-store');
      const user = await window.electron.store.get('user');
      // const token = await window.electron.store.get('token');
      // const refreshToken = await window.electron.store.get('refreshToken');
      // console.log('User data:', { user: user.user, accessToken: user.accessToken, refreshToken: user.refreshToken });
      if (user) {
        return { user };
      } else {
        return null
      }
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return { user: null, token: null, refreshToken: null };
    }
  };

  export default getUser