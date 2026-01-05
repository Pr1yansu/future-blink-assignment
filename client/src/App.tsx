import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoginModal } from './pages/Login';
import { FlowBuilder } from './pages/FlowBuilder';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LoginModal />
        <Routes>
          <Route path="/" element={<FlowBuilder />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
