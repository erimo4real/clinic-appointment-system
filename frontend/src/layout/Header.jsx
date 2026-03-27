import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../features/auth/store/authSlice';

const HeartIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = () => (
  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const Header = ({ user: propUser, onLogout }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  
  const user = propUser || authState.user;
  const isAuthenticated = authState.isAuthenticated;
  
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await dispatch(logoutAction());
      navigate('/login');
    }
    setIsProfileOpen(false);
  };

  const notifications = [
    { id: 1, title: 'Appointment confirmed', time: '2 hours ago' },
    { id: 2, title: 'New doctor available', time: '1 day ago' },
  ];

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-700',
      doctor: 'bg-blue-100 text-blue-700',
      patient: 'bg-green-100 text-green-700',
    };
    return badges[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <HeartIcon />
            </div>
            <span className="text-xl font-bold text-gray-900">MedBook Pro</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/services') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Services
            </Link>
            <Link 
              to="/doctors" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/doctors') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Doctors
            </Link>
            <Link 
              to="/about" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/about') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              About
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notification Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotificationOpen(!isNotificationOpen);
                      setIsProfileOpen(false);
                    }}
                    className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <BellIcon />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>

                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm text-gray-900 font-medium">{notif.title}</p>
                            <p className="text-xs text-gray-500">{notif.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsNotificationOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.firstName || user?.first_name || user?.username || 'User'}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadge(user?.role)}`}>
                          {user?.role}
                        </span>
                      </div>
                      <div className="py-1">
                        {user?.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <DashboardIcon />
                            <span className="ml-2">Admin Panel</span>
                          </Link>
                        )}
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <UserIcon />
                          <span className="ml-2">My Profile</span>
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogoutIcon />
                          <span className="ml-2">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/booking" 
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XIcon />
            ) : (
              <MenuIcon />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/services') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/doctors" 
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/doctors') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Doctors
              </Link>
              <Link 
                to="/about" 
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/about') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <hr className="my-2" />
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link 
                    to="/profile" 
                    className="px-3 py-2 text-gray-600 rounded-lg text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="px-3 py-2 text-red-600 rounded-lg text-sm font-medium text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-3 py-2 text-gray-600 rounded-lg text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/booking" 
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Book Now
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
