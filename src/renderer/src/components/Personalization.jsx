import React, { useState, useEffect } from 'react';

const Personalization = () => {
  const [logo, setLogo] = useState(null);
  const [footerText, setFooterText] = useState('');

  useEffect(() => {
    // Load the stored values when the component mounts
    const fetchStoredData = async () => {
      try {
        const storedLogo = await window.electron.store.get('logo');
        const storedFooterText = await window.electron.store.get('footerText');

        if (storedLogo) {
          setLogo(storedLogo);
        }

        if (storedFooterText) {
          setFooterText(storedFooterText);
        }
      } catch (error) {
        console.error('Error fetching stored data:', error);
      }
    };

    fetchStoredData();
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        setLogo(result);
        // Save the logo to the user's local storage
        window.electron.store.set('logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFooterTextChange = (e) => {
    const text = e.target.value;
    setFooterText(text);
    window.electron.store.set('footerText', text);
  };

  return (
    <div className="personalization p-4">
      <h2 className="text-2xl font-semibold mb-4">Personalización del Ticket</h2>
      <div className='card bg-white shadow-md p-4 mb-4 rounded-md min-w-[260px]'>
        {/* <div className="mb-4">
            <label className="label">Subir Logo</label>
            <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="input input-md rounded-md border-1 border-stone-300 w-full"
            />
            {logo && <img src={logo} alt="Logo" className="mt-4 w-32 h-32 object-contain" />}
        </div> */}
        <div className="mb-4">
            <label className="label">Texto de Pie de Página</label>
            <input
            type="text"
            value={footerText}
            onChange={handleFooterTextChange}
            className="input input-md rounded-md border-1 border-stone-300 w-full"
            placeholder="Ejemplo: ¡Gracias por tu compra!"
            />
        </div>
      </div>
    </div>
  );
};

export default Personalization;
