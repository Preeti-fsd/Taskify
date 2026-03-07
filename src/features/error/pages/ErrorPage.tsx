import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import styles from "../styles/ErrorPage.module.css";

const ErrorPage = () => {
  const error = useRouteError();

  let message = "Something went wrong";

  if (isRouteErrorResponse(error)) {
    message = error.statusText || message;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.code}>404</h1>

      <h2 className={styles.title}>Oops! Page  {message}</h2>

      <p className={styles.message}>
       The page you are looking for does not exist or something went wrong.
      </p>
     
      <Link to="/" className={styles.homeButton}>
        Go back home
      </Link>
    </div>
  );
};

export default ErrorPage;