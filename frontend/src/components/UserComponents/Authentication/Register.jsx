import { Link, useNavigate } from "react-router-dom";
import avatar from "../../../assets/img/Profile.png";
import styles from "./styles/Username.module.css";
import extend from "./styles/profile.module.css";
import { Toaster } from "react-hot-toast";
import { toast } from "react-toastify";

import { useRegisterMutation } from "../../../slices/UsersApiSlice";
import { useDispatch } from "react-redux";
// import { setCredentials } from "../../../slices/AuthSlice";
import validationSchema from "./helper/validate";
import { useFormik } from "formik";
import { useState } from "react";
import convertTobase64 from "./helper/convert";
import Loader from "../../../loader/ClimbingBoxLoader";
import { setUsers } from "../../../slices/UserSlice";

const Register = () => {
  const [file, setFile] = useState();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { userInfo } = useSelector((state) => state.authUser);
  const [register, { isLoading }] = useRegisterMutation();

  // useEffect(() => {
  //   if (userInfo) {
  //     navigate("/");
  //   }
  // }, [navigate, userInfo]);

  const formik = useFormik({
    initialValues: {
      email: "",
      userName: "",
      password: "",
      confirm_pwd: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      values = await Object.assign(values, { profilePic: file || "" });
     
      try {
        const res = await register({
          values,
        }).unwrap();
  
        dispatch(setUsers(res));
        navigate("/login-profile");
        toast("Check your emil...");
      } catch (err) {
        toast.error(err.data?.message || err.error);
      }
    },
  });

  const onUpload = async (e) => {
    const base64 = await convertTobase64(e.target.files[0]);
    setFile(base64);
  };

  return (
    <div className="container mx-auto">
      {<Toaster position="top-center" reverseOrder={false}></Toaster>}
      <div
        className=" my-4 row flex justify-center items-center h-screen"
        style={{ height: "fit-content" }}
      >
        <div className={`${styles.glass} ${extend.glass}`}>
          <div
            className="title flex flex-col items-center"
            style={{ marginTop: "-10%" }}
          >
            <h6 className="text-xl font-bold">Register</h6>
            <span className=" w-2/3 text-sm text-center text-gray-500">
              Happy to join you.
            </span>
          </div>

          <form className="py-1" onSubmit={formik.handleSubmit}>
            <div className="profile flex justify-center py-3">
              <label htmlFor="profile">
                {isLoading ? (
                  <Loader color="#36d7b7" />
                ) : (
                  <img
                    src={file || avatar}
                    className={`${styles.profile_img} ${extend.profile_img}`}
                    alt="avatar"
                  />
                )}
              </label>
              <input
                onChange={onUpload}
                type="file"
                name="profile"
                id="profile"
              />
            </div>

            <div className="textbox flex flex-col items-center gap-3">
              <input
                {...formik.getFieldProps("userName")}
                className={
                  formik.errors.userName && formik.touched.userName
                    ? styles.inputError
                    : styles.textbox
                }
                type="text"
                placeholder="Username"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.errors.username && formik.touched.username && (
                <span className={styles.error}>{formik.errors.username}</span>
              )}
              <input
                {...formik.getFieldProps("email")}
                className={
                  formik.errors.email && formik.touched.email
                    ? styles.inputError
                    : styles.textbox
                }
                type="text"
                placeholder="Email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.errors.email && formik.touched.email && (
                <span className={styles.error}>{formik.errors.email}</span>
              )}
              <input
                {...formik.getFieldProps("password")}
                className={
                  formik.errors.password && formik.touched.password
                    ? styles.inputError
                    : styles.textbox
                }
                type="password"
                placeholder="Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.errors.password && formik.touched.password && (
                <span className={styles.error}>{formik.errors.password}</span>
              )}

              <input
                {...formik.getFieldProps("confirm_pwd")}
                className={
                  formik.errors.confirm_pwd && formik.touched.confirm_pwd
                    ? styles.inputError
                    : styles.textbox
                }
                type="password"
                placeholder="Confirm Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.errors.confirm_pwd && formik.touched.confirm_pwd && (
                <span className={styles.error}>
                  {formik.errors.confirm_pwd}
                </span>
              )}

              <button className={styles.btn} type="submit">
                Next
              </button>
            </div>
            <div className="text-center pt-2" style={{ marginBottom: "-10%" }}>
              <span className="text-black-500">
                Already a Member ?{"  "}
                <Link
                  className="text-red-500 text-decoration-none"
                  to="/username"
                >
                  Sign In
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
