import { useNavigate } from "react-router-dom";
import styles from "../styles/Home.module.css";
import type { TabCard } from "../../../types/home";

interface tabCardProps {
    tab: TabCard
  }

const CardNav = ({ tab }: tabCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      key={tab.id}
      className={styles.card}
      onClick={() => navigate(tab.path)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          navigate(tab.path);
        }
      }}
    >
      <h2>{tab.title}</h2>
      <p>{tab.description}</p>
    </div>
  );
};

export default CardNav;
