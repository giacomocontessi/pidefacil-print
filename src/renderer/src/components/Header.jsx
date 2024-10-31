import React, { useState } from 'react';

const Header = ({ setActiveScreen }) => {
  return (
    <div className="bg-transparent flex justify-between items-center flex-col mt-16">
      {/* <h1 className="text-2xl text-white font-bold">Configuración de la Aplicación</h1> */}
      <div className="flex flex-row gap-4 items-center justify-between">
        <button
          className="btn btn-secondary bg-main text-white"
          onClick={() => setActiveScreen('printers')}
        >
          Impresoras
        </button>
        <button
          className="btn btn-secondary bg-main text-white"
          onClick={() => setActiveScreen('customization')}
        >
          Personalización
        </button>
      </div>
    </div>
  );
};

export default Header;
