import styles from "../styles/Home.module.css";
import { homeConstants } from "../constants/constants";
import CardNav from "../components/CardNav";
import { Rocket } from "lucide-react";

const Home = () => {
  return (
    <>
      <main className={styles.container}>
        <h1 className={styles.title}>Welcome to Your Productivity Hub <Rocket size={28}/></h1>

        <p className={styles.subtitle}>
          Organize your tasks, track your progress, and stay ahead every day.
        </p>

        <div className={styles.cardWrapper}>
          {homeConstants?.dashboardCards.map((tab) => (
            <CardNav tab={tab} key={tab.id} />
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
