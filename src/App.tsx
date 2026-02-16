import { Routes, Route } from "react-router";
import { AuthProvider } from "./providers/auth/auth-provider";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeView from "./views/HomeView";
import LoginView from "./views/LoginView";
import TaskBoardView from "./views/TaskBoardView";

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route path="/login" element={<LoginView />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/taskboard" element={<TaskBoardView />} />
      </Route>
    </Routes>
  </AuthProvider>
);

export default App;
