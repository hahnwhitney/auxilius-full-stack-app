import Button from "../Button";
import styles from "./index.module.css";

interface IHeader {
  currentUsername: string;
  logOutFn: () => void;
}

const Header = ({ currentUsername, logOutFn }: IHeader) => (
  <header className={styles.header}>
    <div className={styles.username}>{currentUsername}</div>
    <Button type="button" text="Log Out" onClick={logOutFn} />
  </header>
);

export default Header;
