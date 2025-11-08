import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Banners from './pages/Banners';
import Categories from './pages/Categories';
import SubCategories from './pages/SubCategories';
import Options from './pages/Options';
import SubOptions from './pages/SubOptions';
import Pricing from './pages/Pricing';
import Advertisements from './pages/Advertisements';
import BuyerAdvertisements from './pages/BuyerAdvertisements';
import SellerAdvertisements from './pages/SellerAdvertisements';
import Homepage from './pages/Homepage';
import Sellers from './pages/Sellers';
import Leads from './pages/Leads';
import Feedback from './pages/Feedback';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/banners"
            element={
              <ProtectedRoute>
                <Layout>
                  <Banners />
                </Layout>
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <Categories />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subcategories"
            element={
              <ProtectedRoute>
                <Layout>
                  <SubCategories />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/options"
            element={
              <ProtectedRoute>
                <Layout>
                  <Options />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sub-options"
            element={
              <ProtectedRoute>
                <Layout>
                  <SubOptions />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <Layout>
                  <Pricing />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/advertisements"
            element={<Navigate to="/advertisements/seller" replace />}
          />
          <Route
            path="/advertisements/seller"
            element={
              <ProtectedRoute>
                <Layout>
                  <SellerAdvertisements />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/advertisements/buyer"
            element={
              <ProtectedRoute>
                <Layout>
                  <BuyerAdvertisements />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/homepage"
            element={
              <ProtectedRoute>
                <Layout>
                  <Homepage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sellers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Sellers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute>
                <Layout>
                  <Leads />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <Layout>
                  <Feedback />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
