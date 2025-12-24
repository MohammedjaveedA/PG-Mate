// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoleSelection from './pages/RoleSelectionPage';
import StudentDashboard from './pages/student/Dashboard';
import OwnerDashboard from './pages/owner/Dashboard';
// Import new components
import MyIssues from './pages/student/MyIssues';
import CreateIssue from './pages/student/CreateIssue';
import OwnerIssues from './pages/owner/Issue';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/select-role" element={<RoleSelection />} />
        
        {/* Student Routes */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/issues" element={<MyIssues />} />
        <Route path="/student/issues/create" element={<CreateIssue />} />
        
        {/* Owner Route */}
        <Route path="/owner" element={<OwnerDashboard />} />
         <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/issue" element={<OwnerIssues />} />
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;