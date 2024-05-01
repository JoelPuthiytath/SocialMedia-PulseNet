import { Link } from "react-router-dom";
import avatar from "../../../assets/img/pulseNet.png";
import styles from "./styles/Username.module.css";
// import { Toaster } from "react-hot-toast";
import validationSchema from "./helper/validate";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { useGetUserMutation } from "../../../slices/UsersApiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../slices/AuthSlice";
import { setUsers } from "../../../slices/UserSlice";
import { useEffect } from "react";
import { useTheme } from "@mui/material";
const Username = () => {
  const [getUser, { isLoading }] = useGetUserMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const formik = useFormik({
    initialValues: {
      userName: "",
    },
    validateOnBlur: false,
    validateOnChange: false,

    onSubmit: async (values) => {
      try {
        let res = await getUser(values).unwrap();
        // toast(res.message);
        dispatch(setUsers(res));
        navigate("/password");
      } catch (err) {
        console.log(err.data?.message);
        toast.error(err.data?.message || err.error);
      }
    },
  });

  return (
    <div className="container body mx-auto">
      {<Toaster position="top-center" reverseOrder={false}></Toaster>}
      <div className="flex justify-center items-center h-screen">
        <div className={styles.glass}>
          <div className="title flex flex-col items-center">
            <h6 className="text-3xl font-bold">Hello Again!</h6>
            <span className="py-1 w-2/3 text-center text-gray-500">
              Explore More by connecting with us.
            </span>
          </div>

          <form onSubmit={formik.handleSubmit} className="py-1">
            <div className="profile flex justify-center py-2">
              <img src={avatar} className={styles.profile_img} alt="avatar" />
            </div>

            <div className="textbox flex flex-col items-center gap-4">
              <input
                {...formik.getFieldProps("userName")}
                name="userName"
                style={{
                  color: theme.palette.mode === "dark" ? "black" : "black",
                }}
                className={
                  formik.errors.userName && formik.touched.userName
                    ? styles.inputError
                    : styles.textbox
                }
                type="text"
                placeholder="Username"
              />
              {formik.errors.userName && formik.touched.userName && (
                <span className={styles.error}>{formik.errors.userName}</span>
              )}
              <button className={styles.btn} type="submit">
                Next
              </button>
            </div>
            <div className="text-center pt-4">
              <span className="text-white">
                Not a Member{" "}
                <Link
                  className="text-red-500 text-decoration-none"
                  to="/register"
                >
                  Register Now
                </Link>
              </span>
            </div>
          </form>
        </div>
        <div className="ms-2 @apply border-4 border-gray-50 shrink h-3/4 w-[30%] rounded-3xl py-20 px-7 min-w-max">
          <small className="text-xm">
            If you don't feel like signing up but just want to check out the
            website,
            <br /> feel free to use the username and password below.
          </small>{" "}
          <div className="mt-3">
            Username: <span className="text-primary">pulseNetGuest</span> <br />
            password: <span className="text-danger">ddd3V</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Username;
