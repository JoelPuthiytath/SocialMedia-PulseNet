import { Link, useNavigate } from "react-router-dom";
import styles from "./styles/Username.module.css";
import toast, { Toaster } from "react-hot-toast";
import validationSchema from "./helper/validate";
import { useFormik } from "formik";
import { useResetPasswordMutation } from "../../../slices/UsersApiSlice";
import { useSelector } from "react-redux";
import { date } from "yup";
const Reset = () => {
  const [resetPassword] = useResetPasswordMutation();
  const { users } = useSelector((state) => state.users);
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      password: "",
      confirm_pwd: "",
    },
    validateOnBlur: false,
    // validationSchema: validationSchema,
    validateOnChange: false,
    onSubmit: async (values) => {
      const { password } = values;
      const { userName } = users;
      try {
        const res = await resetPassword({ userName, password });
     
        if (res?.data?.success) {
          toast.success(res?.message);
          navigate("/password");
        } else {
          // toast.error(res.data.message);
        }
      } catch (error) {
        // toast.error(error);
      }
    },
  });

  return (
    <div className="container mx-auto">
      {<Toaster position="top-center" reverseOrder={false}></Toaster>}
      <div className="flex justify-center items-center h-screen">
        <div className={styles.glass}>
          <div className="title flex flex-col items-center">
            <h6 className="text-3xl font-bold">Reset</h6>
            <span className="py-1 w-2/3 text-center text-gray-500">
              Enter new password.
            </span>
          </div>
          <form className="py-10" onSubmit={formik.handleSubmit}>
            <div className="textbox flex flex-col items-center gap-6">
              <input
                {...formik.getFieldProps("password")}
                className={
                  formik.errors.password && formik.touched.password
                    ? styles.inputError
                    : styles.textbox
                }
                type="text"
                placeholder="New Password"
                // onChange={formik.handleChange}
                // onBlur={formik.handleBlur}
              />
              {formik.errors.password && formik.touched.password && (
                <span className={styles.error}>{formik.errors.password}</span>
              )}
              <input
                {...formik.getFieldProps("confirm_pwd")}
                className={
                  formik.errors.password && formik.touched.password
                    ? styles.inputError
                    : styles.textbox
                }
                type="text"
                placeholder="Confirm Password"
              />
              <button
                disabled={
                  formik.errors.confirm_pwd && formik.touched.confirm_pwd
                }
                className={styles.btn}
                type="submit"
              >
                Reset
              </button>
            </div>
            {formik.errors.confirm_pwd && formik.touched.confirm_pwd && (
              <span className={styles.error}>{formik.errors.confirm_pwd}</span>
            )}
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
      </div>
    </div>
  );
};

export default Reset;
