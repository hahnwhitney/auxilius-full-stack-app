import { Link } from "react-router";
import styles from "./index.module.css";

const HomeView = () => (
  <div className={styles.landingWrapper}>
    <h1>Hello, future coworkers!</h1>

    <Link to="/login">Login</Link>

    <p>
      Don't have an account? <Link to="/signup">Sign Up</Link>
    </p>
  </div>
);

export default HomeView;
