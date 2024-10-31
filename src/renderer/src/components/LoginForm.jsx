import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from "../assets/pidefacil-logo-header.png";
import getUser from '../utils/getUser';
    
const LoginForm = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
  
    useEffect(() => {
        // Check if the user is already logged in
        const storedUser = getUser()
        console.log('stored user', storedUser)
        if (storedUser?.user) {
          onLoginSuccess(storedUser);
        }
    
        // Initialize Google Sign-In
        window.onload = () => {
          google.accounts.id.initialize({
            client_id: '22968851572-0bt7si3inkbubr3nh1i2ebatl2rtebsv.apps.googleusercontent.com',
            callback: handleGoogleLogin
          });
    
          google.accounts.id.renderButton(
            document.getElementById('googleSignInDiv'),
            { theme: 'outline', size: 'large', width: '100%' }
          );
        };
      }, []);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('https://api.pidefacil.app/api/users/login', {
          email,
          password,
        });
  
        const user = response.data;
        console.log(user)
        window.electron.store.set('user', user);  // Store user data
  
        onLoginSuccess(user.user);
      } catch (error) {
        const message = error.response?.data?.error || 'Error al iniciar sesión, por favor intenta de nuevo.';
        setErrorMessage(message);
      }
    };
  
    const handleGoogleLogin = async (googleResponse) => {
      const tokenId = googleResponse.credential;
  
      try {
        const response = await axios.post('https://api.pidefacil.app/api/users/google-login', {
          tokenId
        });
  
        const user = response.data.user;
        window.electron.store.set('user', user);  // Store user data
  
        onLoginSuccess(user);
      } catch (error) {
        setErrorMessage('Error al iniciar sesión con Google. Por favor intenta de nuevo.');
      }
    };
  
    return (
    <div className="login-form card bg-white p-8 min-w-96">
      <img src={logo} className="text-center w-40 mx-auto mb-8"/>
      <h2 className="text-xl font-semibold">Iniciar Sesión</h2>
      <p className="text-stone-500 mb-4">Inicia Sesión con la misma cuenta que entras a tu menú PideFácil</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input rounded-md w-full"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input rounded-md w-full"
          />
        </div>
        {errorMessage && 
          <div role="alert" className="alert alert-error mt-4 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                color="white" />
            </svg>
            <span className='text-white'>{errorMessage}</span>
          </div>
        }
        <button
          type="submit"
          className='btn btn-outline w-full mt-4 bg-main text-white'
        >Iniciar Sesión</button>
      </form>
      <div className="divider">o</div>
      <div id="googleSignInDiv" className="my-4"></div>
    </div>
  );
};

export default LoginForm;
