import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import { Toaster } from "sonner";
import { useTheme } from "../context/useTheme";
import styles from "../components/layout/Layout.module.css";

const MainLayout = ({ children }: { children?: React.ReactNode }) => {
  const { theme } = useTheme();

  return (
    <>
      <Header />
      <Toaster
        richColors
        theme={theme}
        position="bottom-right"
        toastOptions={{
          className: styles.toaster,
        }}
      />
      {children ? children : <Outlet />}
    </>
  );
};

export default MainLayout;
