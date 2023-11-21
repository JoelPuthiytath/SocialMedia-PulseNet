import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export const PrivateRoute = () => {
  // const { userInfo } = useSelector((state) => state.userInfo);
  const { token } = useSelector((state) => state.authUser);


  return token ? <Outlet /> : <Navigate to="/username" replace />;
};

export const CommonRoute = () => {
  const { token } = useSelector((state) => state.authUser);

  return token === null ? <Outlet /> : <Navigate to="/" replace />;
};

export const AuthorizeUser = () => {
  const { users } = useSelector((state) => state.users);
  // console.log(users, "<users ===");
  return users ? <Outlet /> : <Navigate to="/" replace />;
};

export const EitherUser = () => {
  const { users } = useSelector((state) => state.users);
  const { token } = useSelector((state) => state.authUser);
  const access = token === null ? users : token;
  // console.log(access, "<==access");

  // console.log(users, "<users ===");
  return access ? <Outlet /> : <Navigate to="/" replace />;
};
// export default PrivateRoute;
