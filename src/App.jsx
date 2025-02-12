import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import store from './store';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Pages
import Home from './pages/Home';
import Room from './pages/Room';
import NewRoom from './pages/NewRoom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NewPlace from './pages/NewPlace';
import Place from './pages/Place';
import MyPlaces from './pages/MyPlaces';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1db954',
    },
    secondary: {
      main: '#1ed760',
    },
    background: {
      default: '#000000',
      paper: 'rgba(18, 18, 18, 0.15)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Space Grotesk", sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.02em'
    },
    h5: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 500,
      letterSpacing: '0.5px'
    },
    h6: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
    },
    button: {
      fontFamily: '"Quicksand", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.5px'
    },
    body1: {
      fontFamily: '"Quicksand", sans-serif',
      fontWeight: 500,
    },
    body2: {
      fontFamily: '"Quicksand", sans-serif',
      fontWeight: 400,
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@keyframes pulse': {
          '0%': {
            opacity: 0.3,
          },
          '50%': {
            opacity: 0.6,
          },
          '100%': {
            opacity: 0.3,
          },
        },
        'html, body': {
          background: '#000000',
          minHeight: '100vh',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(29, 185, 84, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(29, 185, 84, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(29, 185, 84, 0.08) 0%, transparent 60%),
              radial-gradient(circle at 20% 80%, rgba(29, 185, 84, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(29, 185, 84, 0.15) 0%, transparent 50%)
            `,
            animation: 'pulse 8s ease-in-out infinite',
            filter: 'blur(100px) brightness(1.5)',
            opacity: 0.5,
            zIndex: 0,
            pointerEvents: 'none'
          },
          '&::after': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
            pointerEvents: 'none',
            zIndex: 1
          }
        },
        '#root': {
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 2,
          isolation: 'isolate'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: '"Quicksand", sans-serif',
          fontWeight: 600,
          letterSpacing: '0.5px'
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SocketProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/room/new" element={<NewRoom />} />
                  <Route path="/room/:roomId" element={<Room />} />
                  <Route path="/place/new" element={<NewPlace />} />
                  <Route path="/place/:placeId" element={<Place />} />
                  <Route path="/my-places" element={<MyPlaces />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile/:username" element={<Profile />} />
                </Routes>
              </Layout>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </MuiThemeProvider>
    </Provider>
  );
}

export default App; 