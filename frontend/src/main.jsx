import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import store from "./store.js";
import { Provider } from "react-redux";
import App from "./App.jsx";
import Admin from "./Admin.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

// other components
import HomeScreen from "./screens/Home/HomeScreen.jsx";
import Messenger from "./screens/messenger/messenger.jsx";
import PostModal from "./screens/widgets/postModel.jsx";
import {
  PrivateRoute,
  AuthorizeUser,
  EitherUser,
  CommonRoute,
} from "./components/PrivateRoute.jsx";
import AdminPrivateRoute from "./components/AdminComponents/AdminPrivateRoute.jsx";
import AdminLoginScreen from "./components/AdminComponents/AdminLogin.jsx";
import AdminDashboard from "./screens/AdminScreen/AdminDashboard.jsx";
import AdminUserEdit from "./screens/AdminScreen/AdminUserEdit.jsx";
// import AdminCreateUser from "./components/AdminComponents/AdminCreateUser.jsx";
import AdminHome from "./screens/AdminScreen/AdminHome.jsx";

// Authentication components
import Password from "./components/UserComponents/Authentication/Password.jsx";
import Profile from "./components/UserComponents/Authentication/Profle.jsx";
import Recovery from "./components/UserComponents/Authentication/Recovery.jsx";
import Username from "./components/UserComponents/Authentication/Username.jsx";
import Register from "./components/UserComponents/Authentication/Register.jsx";
import Reset from "./components/UserComponents/Authentication/Reset.jsx";
import NotFound from "./components/UserComponents/Authentication/NotFound.jsx";
import ProfilePage from "./screens/Profile/profilePage.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />}>
        <Route path="" element={<CommonRoute />}>
          <Route path="/username" element={<Username />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="*" element={<NotFound />} />
        <Route path="/restricted" element={<NotFound />} />

        <Route path="" element={<AuthorizeUser />}>
          <Route path="/password" element={<Password />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/reset" element={<Reset />} />
        </Route>
        <Route path="" element={<PrivateRoute />}>
          <Route index={true} path="/" element={<HomeScreen />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/messenger" element={<Messenger />} />
          <Route path="/posts/:postId" element={<PostModal />} />
        </Route>

        {/* private route */}
        <Route path="" element={<EitherUser />}>
          <Route path="/login-profile" element={<Profile />} />
          {/* <Route path="/home" element={<HomeScreen />} /> */}
        </Route>
      </Route>

      <Route path="/admin" element={<Admin />}>
        <Route path="/admin" element={<AdminLoginScreen />} />
        <Route path="" element={<AdminPrivateRoute />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="home" element={<AdminHome />} />
          <Route path="edit/:id" element={<AdminUserEdit />} />
          <Route path="posts/:postId" element={<PostModal />} />
          {/* <Route path="create" element={<AdminCreateUser />} /> */}
        </Route>
      </Route>
    </>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistStore(store)}>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </PersistGate>
  </Provider>
);
