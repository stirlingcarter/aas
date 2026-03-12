import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Layout, ProtectedRoute } from './components/Layout';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { NewCommitment } from './pages/NewCommitment';
import { CommitmentDetail } from './pages/CommitmentDetail';
import { Verify } from './pages/Verify';
import { Review } from './pages/Review';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter basename="/aas">
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/new"
              element={<ProtectedRoute><NewCommitment /></ProtectedRoute>}
            />
            <Route
              path="/commitment/:id"
              element={<ProtectedRoute><CommitmentDetail /></ProtectedRoute>}
            />
            <Route
              path="/commitment/:id/verify"
              element={<ProtectedRoute><Verify /></ProtectedRoute>}
            />
            <Route
              path="/commitment/:id/review"
              element={<ProtectedRoute><Review /></ProtectedRoute>}
            />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
