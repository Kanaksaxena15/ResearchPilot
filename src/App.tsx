import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';

// Import Screens/Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { UploadPaper } from './pages/UploadPaper';
import { MyPapers } from './pages/MyPapers';
import { PaperDetails } from './pages/PaperDetails';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Screens */}
          <Route path="/" element={<Landing />} />
          <Route 
            path="/login" 
            element={
              <MainLayout>
                <Login />
              </MainLayout>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <MainLayout>
                <Signup />
              </MainLayout>
            } 
          />

          {/* Secure/Protected Research Assistant Core Workspace */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UploadPaper />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/papers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MyPapers />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/papers/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PaperDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/papers/:id/summary"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PaperDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/papers/:id/ask"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PaperDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/papers/:id/insights"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PaperDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 Route */}
          <Route 
            path="/404" 
            element={
              <MainLayout>
                <NotFound />
              </MainLayout>
            } 
          />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
