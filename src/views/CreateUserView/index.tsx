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
  const [usernameErrorMsg, setUsernameErrorMsg] = useState("");

  const validateUsername = async (username: string) => {
    if (username.length < 1) {
      setUsernameErrorMsg("Username is required");
      return false;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (res.status === 409) {
        setUsernameErrorMsg("Username already taken");
        return false;
      }
      if (!res.ok) {
        setUsernameErrorMsg("Unable to create user");
        return false;
      }
      return true;
    } catch {
      setUsernameErrorMsg("Unable to create user");
      return false;
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameErrorMsg("");

    if (await validateUsername(username)) {
      setCurrentUsername(username);
      setUsername("");

      setIsAuthenticated(true);
      navigate("/taskboard");
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
