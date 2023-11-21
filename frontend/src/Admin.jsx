import { Container } from "react-bootstrap";
// import Header from "./components/header";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminHeader from "./components/AdminComponents/AdminHeader";
import { useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material";
import { themeSettings } from "./theme";
import { useMemo } from "react";

const Admin = () => {
  const { mode } = useSelector((state) => state.adminAuth);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return (
    <>
      <ToastContainer />
      <div className="Admin-App">
        <ThemeProvider theme={theme}>
          <Container>
            <Outlet />
          </Container>
        </ThemeProvider>
      </div>
    </>
  );
};

export default Admin;
