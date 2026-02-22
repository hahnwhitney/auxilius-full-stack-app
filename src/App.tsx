import { Routes, Route } from "react-router";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./providers/auth/auth-provider";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeView from "./views/HomeView";
import CreateUserView from "./views/CreateUserView";
import LoginView from "./views/LoginView";
import TaskBoardView from "./views/TaskBoardView";

const App = () => (
  <AuthProvider>
    <ToastContainer position="top-center" />
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route path="/login" element={<LoginView />} />
      <Route path="/signup" element={<CreateUserView />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/taskboard" element={<TaskBoardView />} />
      </Route>
    </Routes>
  </AuthProvider>
);

export default App;
