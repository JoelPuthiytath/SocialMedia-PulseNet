// import Header from "./components/header";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme.js";

import "./App.css";

// admin  imports >>>
import AdminHeader from "./components/AdminComponents/AdminHeader";

// end
const App = () => {
  const { mode } = useSelector((state) => state.authUser);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  // console.log(theme, "<== theme");
  return (
    <>
      <ToastContainer />
      <div className="App">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Outlet />
        </ThemeProvider>
      </div>
    </>
  );
};

export default App;
