const updateTokens = (accessToken, refreshToken) => {
    window.electron.store.set('token', accessToken);
    window.electron.store.set('refreshToken', refreshToken);
  };

  export default updateTokens