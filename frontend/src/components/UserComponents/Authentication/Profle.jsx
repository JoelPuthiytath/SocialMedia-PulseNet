import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import avatar from "../../../assets/img/Profile.png";
import styles from "./styles/Username.module.css";
import extend from "./styles/profile.module.css";
import toast, { Toaster } from "react-hot-toast";
import { useFormik } from "formik";
import { useState, useEffect } from "react";
import convertTobase64 from "./helper/convert";
import {
  useUpdateUserMutation,
  useEmailVerifyMutation,
} from "../../../slices/UsersApiSlice";
// import { toast } from "react-toastify";
import { setCredentials } from "../../../slices/AuthSlice";
import Loader from "../../../loader/ClimbingBoxLoader";
import { useRef } from "react";
import { clearUsers, setUsers } from "../../../slices/UserSlice";

const Profile = () => {
  const { userInfo } = useSelector((state) => state.authUser);
  const { users } = useSelector((state) => state.users);

  const [updateUser] = useUpdateUserMutation();
  const [emailVerify, { isLoading }] = useEmailVerifyMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [file, setFile] = useState();
  const [searchParams, setSearchParams] = useSearchParams();

  const emailToken = searchParams.get("emailToken");
  // const { emailToken } = useParams();
  const hasEffectRun = useRef(false);

  useEffect(() => {
    console.log("haii");
    if (!hasEffectRun.current) {
      console.log(users, "<==users");
      (async () => {
        try {
          if (users?.isVerified) {
            console.log(users.isVerified, "<===users");
          } else {
            console.log(users?.isVerified, "checking weather verified or not");
            console.log(emailToken, "<emailtoken");
            const res = await emailVerify({ emailToken });
            console.log({ ...res?.data?.user }, "<==1 register res");
            console.log(res?.data?.token, "<==2 register res");
            console.log(res?.data, "<==3 register res");
            console.log(res, "<==4 register res");

            if (res?.data?.user?.isVerified) {
              console.log("before adding to creditiental");
              toast.success("Email verified successfully...");
              dispatch(
                setCredentials({
                  userInfo: res.data.user,
                  token: res.data.token,
                })
              );
              dispatch(setUsers(res.data.user));
              console.log("cherk in profile useEffect");
            }
            console.log(res.error?.status);
          }
        } catch (error) {
          toast.error(error);
        }
      })();
      hasEffectRun.current = true;
    }
  }, [userInfo]);

  const formik = useFormik({
    initialValues: {
      firstName: userInfo?.firstName || users?.firstName || "",
      lastName: userInfo?.lastName || users?.lastName || "",
      email: userInfo?.email || users?.email || "",
      phone: userInfo?.phone || users?.phone || "",
      address: userInfo?.address || users?.address || "",
    },
    validateOnBlur: false,
    validateOnChange: false,

    onSubmit: async (values) => {
      try {
        console.log("inside profile submit function");
        values = await Object.assign(values, { profilePic: file || "" });
        const res = await updateUser(values).unwrap();
        console.log(res, "< onsubmit res in profile");

        dispatch(setCredentials({ userInfo: { ...res } }));
        navigate("/");
        dispatch(clearUsers());
      } catch (err) {
        console.log(err);
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
      <span> {userInfo?.data?.isVerified}</span>
      {<Toaster position="top-center" reverseOrder={false}></Toaster>}
      {userInfo && userInfo?.isVerified ? (
        <>
          <div className="flex justify-center items-center h-screen">
            <div className={`${styles.glass} ${extend.glass}`}>
              <div
                className="title flex  flex-col items-center"
                style={{ marginTop: "-8%" }}
              >
                <h6 className="text-xl font-bold">Profile</h6>
                <span className=" w-2/3 text-sm text-center text-gray-500">
                  You can update the details here.
                </span>
              </div>

              <form className="py-1" onSubmit={formik.handleSubmit}>
                <div className="profile flex justify-center py-3">
                  <label htmlFor="profile">
                    <img
                      src={userInfo?.profilePic || file || avatar}
                      className={`${styles.profile_img} ${extend.profile_img}`}
                      alt="avatar"
                    />
                  </label>
                  <input
                    onChange={onUpload}
                    type="file"
                    name="profile"
                    id="profile"
                  />
                </div>

                <div className="textbox flex flex-col items-center gap-3">
                  <div className="name  flex w-3/4 gap-10">
                    <input
                      {...formik.getFieldProps("firstName")}
                      className={`${styles.textbox} ${extend.textbox}`}
                      type="text"
                      placeholder="First Name"
                    />

                    <input
                      {...formik.getFieldProps("lastName")}
                      className={`${styles.textbox} ${extend.textbox}`}
                      type="text"
                      placeholder="Last Name"
                    />
                  </div>
                  <div className="name  flex w-3/4 gap-10">
                    <input
                      {...formik.getFieldProps("phone")}
                      className={`${styles.textbox} ${extend.textbox}`}
                      type="text"
                      placeholder="Mobile"
                    />

                    <input
                      {...formik.getFieldProps("email")}
                      className={
                        formik.errors.email && formik.touched.email
                          ? styles.inputError
                          : `${styles.textbox} ${extend.textbox}`
                      }
                      type="text"
                      placeholder="Email"
                    />
                  </div>
                  {formik.errors.email && formik.touched.email && (
                    <span className={styles.error}>{formik.errors.email}</span>
                  )}
                  <input
                    {...formik.getFieldProps("address")}
                    className={`${styles.textbox} ${extend.textbox}`}
                    type="text"
                    placeholder="Address"
                  />
                  <button className={styles.btn} type="submit">
                    Update
                  </button>
                </div>
                <div
                  className="text-center pt-4"
                  style={{ marginBottom: "-10px" }}
                >
                  <span className="text-black-500">
                    come back later?{" "}
                    <button className="text-red-500" to="/">
                      Logout
                    </button>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className=" row flex justify-center items-center h-screen ">
            <div className="flex flex-col items-center text-xl my-2 bg-black py-3 w-50 h-50 rounded-lg">
              <h5 className="text-white text-sm mt-3 font-bold">
                You should have received an email for account verification
              </h5>
              <span className="text-sm text-gray mb-4 text-gray-500">
                Kindly verify your account by checking your email
              </span>

              <div className="flex flex-col items-center">
                <Loader size={30} color="#36d7b7" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
