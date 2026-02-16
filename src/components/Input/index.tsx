import React, { useState } from "react";
import styles from "./index.module.css";

interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  label: string;
  type:
    | "button"
    | "checkbox"
    | "color"
    | "date"
    | "datetime-local"
    | "email"
    | "file"
    | "hidden"
    | "image"
    | "month"
    | "number"
    | "password"
    | "radio"
    | "range"
    | "reset"
    | "search"
    | "submit"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week";
  id: string;
  placeholderText?: string;
  className?: string;
  value?: string;
  inputValid?: boolean;
  onChange?: (value: string, id: string) => void;
  validationErrorMsg?: string;
}

const Input = ({
  label,
  type,
  id,
  placeholderText,
  className,
  value,
  inputValid,
  onChange,
  validationErrorMsg,
}: InputProps) => {
  const [inputValue, setInputValue] = useState(value);

  return (
    <div className={className || ""}>
      <label
        className={styles.inputFieldLabel}
        style={{ color: inputValid ? "black" : "var(--danger)" }}
        htmlFor={id}
        data-testid={`label-${id}`}
      >
        {label}
      </label>

      <input
        type={type}
        id={id}
        data-testid={id}
        aria-label={label}
        aria-labelledby={`label-${id}`}
        placeholder={placeholderText}
        value={inputValue}
        className={`${styles.inputField} ${!inputValid ? styles.invalid : ""}`}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setInputValue(e.target.value);
          if (onChange) {
            onChange(e.target.value, id);
          }
        }}
        // inputValid is intentionally not passed to the DOM
      />

      {!inputValid && validationErrorMsg && (
        <div className={styles.inputInvalidMessage}>
          <span>{validationErrorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default Input;
