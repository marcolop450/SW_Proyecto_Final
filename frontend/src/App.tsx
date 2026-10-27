import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ProveedorNotificacion } from './context/ContextoNotificacion';
import { ProveedorAutenticacion } from './context/ContextoAutenticacion';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ProveedorNotificacion>
        <ProveedorAutenticacion>
          <AppRoutes />
        </ProveedorAutenticacion>
      </ProveedorNotificacion>
    </BrowserRouter>
  );
};

export default App;
