import React, { useState } from "react";
import { useNavigate } from "react-router";
import Button from "../../components/Button";
import Input from "../../components/Input";
import useAuth from "../../providers/auth/use-auth";
import styles from "./index.module.css";

const LoginScreen = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setCurrentUsername } = useAuth();

  const [username, setUsername] = useState("");
  const [usernameErrorMsg, setUsernameErrorMsg] = useState("");

  const validateUsername = (username: string) => {
    const isValid = username.length >= 1;

    if (!isValid) {
      setUsernameErrorMsg("Username is required");
    }

    return isValid;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameErrorMsg("");
    validateUsername(username);

    // Simulate an API call
    if (validateUsername(username)) {
      setCurrentUsername(username);
      setUsername("");

      // once authenticated, redirect to taskboard route
      setIsAuthenticated(true);
      navigate("/taskboard");
    }
  };

  return (
    <div className={styles.login}>
      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.innerWrapper}>
          <Input
            label="Username"
            type="text"
            id="username"
            value={username}
            onChange={setUsername}
            inputValid={!usernameErrorMsg}
            validationErrorMsg={usernameErrorMsg}
            className={styles.inputWrapper}
          />

          <Button type="submit" text="Log In" onClick={() => {}} />
        </div>
      </form>
    </div>
  );
};

export default LoginScreen;
