import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import Button from "../../components/Button";
import Input from "../../components/Input";
import useAuth from "../../providers/auth/use-auth";
import styles from "./index.module.css";

const CreateUserView = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setCurrentUsername } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameErrorMsg, setUsernameErrorMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState("");

  const validate = () => {
    let valid = true;

    if (username.length < 1) {
      setUsernameErrorMsg("Username is required");
      valid = false;
    } else {
      setUsernameErrorMsg("");
    }

    if (password.length < 8) {
      setPasswordErrorMsg("Password must be at least 8 characters");
      valid = false;
    } else {
      setPasswordErrorMsg("");
    }

    if (confirmPassword !== password) {
      setConfirmPasswordErrorMsg("Passwords do not match");
      valid = false;
    } else {
      setConfirmPasswordErrorMsg("");
    }

    return valid;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.status === 409) {
        setUsernameErrorMsg("Username already taken");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setUsernameErrorMsg(body.error ?? "Unable to create user");
        return;
      }
      setCurrentUsername(username);
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setIsAuthenticated(true);
      navigate("/taskboard");
    } catch {
      setUsernameErrorMsg("Unable to create user");
    }
  };

  return (
    <div className={styles.createUser}>
      <h1>Create an account</h1>

      <form onSubmit={handleCreateUser} className={styles.form}>
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

          <Input
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={setPassword}
            inputValid={!passwordErrorMsg}
            validationErrorMsg={passwordErrorMsg}
            className={styles.inputWrapper}
          />

          <Input
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            inputValid={!confirmPasswordErrorMsg}
            validationErrorMsg={confirmPasswordErrorMsg}
            className={styles.inputWrapper}
          />

          <Button type="submit" text="Sign Up" />
        </div>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default CreateUserView;
