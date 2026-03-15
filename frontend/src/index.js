import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { store } from './store';
import App from './App';
import './index.css';

// React Router v7 future flags to suppress warnings
const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

const LoadingWrapper = () => {
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);
  const [displayLocation, setDisplayLocation] = React.useState(location);
  const [transitionStage, setTransistionStage] = React.useState('fadeIn');

  React.useEffect(() => {
    if (location !== displayLocation) {
      setTransistionStage('fadeOut');
      setLoading(true);
      setTimeout(() => {
        setDisplayLocation(location);
        setTransistionStage('fadeIn');
        setLoading(false);
      }, 400);
    }
  }, [location, displayLocation]);

  return (
    <div className={`${transitionStage}`}>
      {loading && (
        <div className="fixed inset-0 bg-gradient-to-br from-medical-50 via-white to-primary-50 flex items-center justify-center z-50">
          <div className="text-center">
            <svg className="w-20 h-20 text-medical-600 mx-auto heartbeat" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <style>{`
            @keyframes heartbeat {
              0%, 100% { transform: scale(1); }
              15% { transform: scale(1.15); }
              30% { transform: scale(1); }
              45% { transform: scale(1.1); }
            }
            .heartbeat {
              animation: heartbeat 1.5s ease-in-out infinite;
              filter: drop-shadow(0 0 15px rgba(14, 165, 233, 0.5));
            }
            .fadeIn {
              animation: fadeIn 0.4s ease-in-out;
            }
            .fadeOut {
              animation: fadeOut 0.4s ease-in-out;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes fadeOut {
              from { opacity: 1; }
              to { opacity: 0; }
            }
          `}</style>
        </div>
      )}
      <App />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter future={routerFuture}>
        <LoadingWrapper />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
