import React from "react";
import styles from "./index.module.css";

export interface ButtonProps extends React.ComponentProps<"button"> {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  appearance?: "primary" | "secondary";
}

const Button = ({
  text,
  onClick,
  disabled = false,
  className,
  style,
  type = "button",
  appearance = "primary",
}: ButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`${styles.button} ${styles[appearance]} ${className || ""}`}
    style={style ?? style}
  >
    {text}
  </button>
);

export default Button;
