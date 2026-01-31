import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import RevisedBudget from './pages/RevisedBudget';
import BudgetGraph from './pages/BudgetGraph';


import Analytics from './pages/Analytics';
import Invoices from './pages/Invoices';
import Products from './pages/Products';
import Contacts from './pages/Contacts';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PurchaseOrder from './pages/PurchaseOrder';
import PurchaseBill from './pages/PurchaseBill';
import Payment from './pages/Payment';
import SaleOrder from './pages/SaleOrder';
import Receipt from './pages/Receipt';
import AutoAnalytics from './pages/AutoAnalytics';
import DashboardDirect from './pages/DashboardDirect';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Direct Dashboard Demo (No Login Required) */}
          <Route path="/demo" element={<DashboardDirect />} />

          {/* Protected Routes */}
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

          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <Layout>
                  <Budgets />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/revised-budgets"
            element={
              <ProtectedRoute>
                <Layout>
                  <RevisedBudget />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/budget-graph"
            element={
              <ProtectedRoute>
                <Layout>
                  <BudgetGraph />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <Layout>
                  <Invoices />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <Layout>
                  <Contacts />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchase-order"
            element={
              <ProtectedRoute>
                <Layout>
                  <PurchaseOrder />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchase-bill"
            element={
              <ProtectedRoute>
                <Layout>
                  <PurchaseBill />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Layout>
                  <Payment />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sale-order"
            element={
              <ProtectedRoute>
                <Layout>
                  <SaleOrder />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/receipt"
            element={
              <ProtectedRoute>
                <Layout>
                  <Receipt />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/auto-analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <AutoAnalytics />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900">404</h1>
                  <p className="mt-4 text-xl text-gray-600">Page not found</p>
                  <a href="/demo" className="mt-6 inline-block btn-primary">
                    Go to Dashboard
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
