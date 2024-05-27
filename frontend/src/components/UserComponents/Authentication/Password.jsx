import { Link, useNavigate } from "react-router-dom";
import avatar from "../../../assets/img/Profile.png";
import styles from "./styles/Username.module.css";
import toast, { Toaster } from "react-hot-toast";
import { useMediaQuery } from "@mui/material";

// import validationSchema from "./helper/validate";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../../slices/UsersApiSlice";
import { setCredentials } from "../../../slices/AuthSlice";
import { useTheme } from "@mui/material";
// import { toast } from "react-toastify";

const Password = () => {
  const { users } = useSelector((state) => state.users);

  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  const formik = useFormik({
    initialValues: {
      password: "",
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      try {
        let userName = users.userName;
        let password = values.password;
        const res = await login({ userName, password }).unwrap();
        dispatch(
          setCredentials({ userInfo: { ...res.user }, token: { ...res.token } })
        );
        navigate("/login-profile");
      } catch (err) {
        toast.error(err.data?.message || err.error);
      }
    },
  });

  return (
    <div className="container mx-auto">
      {<Toaster position="top-center" reverseOrder={false}></Toaster>}
      <div
        className={
          isNonMobileScreens
            ? "flex flex-col md:flex-row justify-center items-center h-screen"
            : "flex flex-col md:flex-row justify-center items-center h-screen mt-4"
        }
      >
        <div className={styles.glass}>
          <div
            className="title flex flex-col items-center"
            style={{ marginTop: "-10%" }}
          >
            <h6 className="text-3xl font-bold">
              Hi , {users?.firstName || users?.userName}
            </h6>
            <span className="py-1 w-2/3 text-center text-gray-500">
              Explore More by connecting with us.
            </span>
          </div>

          <form className="py-1" onSubmit={formik.handleSubmit}>
            <div className="profile flex justify-center py-2">
              <img
                src={users?.profilePic || avatar}
                className={styles.profile_img}
                alt="avatar"
              />
            </div>

            <div className="textbox flex flex-col items-center gap-3">
              <input
                {...formik.getFieldProps("password")}
                className={
                  formik.errors.password && formik.touched.password
                    ? styles.inputError
                    : styles.textbox
                }
                style={{
                  color: theme.palette.mode === "dark" ? "black" : "black",
                }}
                type="text"
                placeholder="Password"
              />
              {formik.errors.password && formik.touched.password && (
                <span className={styles.error}>{formik.errors.password}</span>
              )}
              <button className={styles.btn} type="submit">
                Next
              </button>
            </div>
            <div className="text-center py-4">
              <span className="text-black-500">
                Forgot Password ?{"  "}
                <Link
                  className="text-red-500 text-decoration-none"
                  to="/recovery"
                >
                  Recover Now
                </Link>
              </span>
            </div>
          </form>
        </div>
        <div
          className={
            isNonMobileScreens
              ? " ms-2 border-4 border-gray-50 shrink h-3/4 w-full md:w-[30%] rounded-3xl py-10 px-7 min-w-max"
              : "mx-auto border-4 border-gray-50 shrink h-3/4 w-full md:w-[30%] rounded-3xl py-10 px-7 min-w-max"
          }
        >
          <small className="text-xm">
            If you don't feel like signing up but just want to check out the
            website,
            <br /> feel free to use the username and password below.
          </small>
          <div className="mt-3">
            Username: <span className="text-primary">pulseNetGuest</span>
            <br />
            password: <span className="text-danger">ddd3V</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Password;
