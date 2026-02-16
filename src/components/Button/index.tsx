import React from "react";
import styles from "./index.module.css";

interface ButtonPropsBase extends React.ComponentProps<"button"> {
  text: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  appearance?: "primary" | "secondary";
}

interface SubmitButtonProps extends ButtonPropsBase {
  type: "submit";
  onClick?: () => void;
}

interface NonSubmitButtonProps extends ButtonPropsBase {
  type?: "button" | "reset";
  onClick: () => void;
}

export type ButtonProps = SubmitButtonProps | NonSubmitButtonProps;

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
