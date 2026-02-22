import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import Button from "../../components/Button";
import Input from "../../components/Input";
import useAuth from "../../providers/auth/use-auth";
import styles from "./index.module.css";

const LoginView = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setCurrentUsername } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (username.length < 1) {
      setErrorMsg("Username is required");
      return;
    }
    if (password.length < 1) {
      setErrorMsg("Password is required");
      return;
    }

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setErrorMsg("Invalid username or password");
        return;
      }
      setCurrentUsername(username);
      setUsername("");
      setPassword("");
      setIsAuthenticated(true);
      navigate("/taskboard");
    } catch {
      setErrorMsg("Unable to log in");
    }
  };

  return (
    <div className={styles.login}>
      <h1>Welcome back!</h1>

      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.innerWrapper}>
          <Input
            label="Username"
            type="text"
            id="username"
            value={username}
            onChange={setUsername}
            inputValid={!errorMsg}
            validationErrorMsg=""
            className={styles.inputWrapper}
          />

          <Input
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={setPassword}
            inputValid={!errorMsg}
            validationErrorMsg={errorMsg}
            className={styles.inputWrapper}
          />

          <Button type="submit" text="Log In" />
        </div>
      </form>

      <p>
        Don't have an account? <Link to="/signup">Create an Account</Link>
      </p>
    </div>
  );
};

export default LoginView;
