import { Navigate, Outlet } from "react-router";
import Header from "../Header";
import useAuth from "../../providers/auth/use-auth";
import styles from "./index.module.css";

const ProtectedRoute = () => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    currentUsername,
    setCurrentUsername,
  } = useAuth();
  const logOut = () => {
    setCurrentUsername("");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.appContainer}>
      <Header currentUsername={currentUsername} logOutFn={logOut} />
      <div className={styles.mainLayout}>
        <div className={styles.routeWrapper}>
          <Outlet />
        </div>

        <footer>
          <span>Auxilius Take-Home Exercise</span>
          <span>Whitney Hahn</span>
        </footer>
      </div>
    </div>
  );
};

export default ProtectedRoute;
