import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import avatar from "../../../assets/img/Profile.png";
import styles from "./styles/Username.module.css";
import extend from "./styles/profile.module.css";
import toast, { Toaster } from "react-hot-toast";
import { useFormik } from "formik";
import { useState, useEffect } from "react";
import convertToBase64 from "./helper/convert";
import validationSchema from "./helper/profileValidate";
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
    if (!hasEffectRun.current) {
      (async () => {
        try {
          if (users?.isVerified) {
            console.log("verified");
            navigate("/");
          } else {
            const res = await emailVerify({ emailToken });

            if (res?.data?.user?.isVerified) {
              toast.success("Email verified successfully...");
              dispatch(
                setCredentials({
                  userInfo: res.data.user,
                  token: res.data.token,
                })
              );
              dispatch(setUsers(res.data.user));
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
      city: userInfo?.address?.city || users?.address?.city || "",
      state: userInfo?.address?.state || users?.address?.state || "",
      pinCode: userInfo?.address?.pinCode || users?.address?.pinCode || "",
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      try {
        values = await Object.assign(values, { profilePic: file || "" });
        const res = await updateUser(values).unwrap();

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
    const base64 = await convertToBase64(e.target.files[0], 400);

    setFile(base64);
  };

  // const onUpload = async (e) => {
  //   const file = e.target.files[0];

  //   const resizedBase64 = await resizeImage(file);
  //   setFile(resizedBase64);
  // };

  // const resizeImage = async () => {
  //   const base64 = await convertTobase64(file, 142, 135);

  //   const img = new Image();
  //   img.src = base64;

  //   return new Promise((resolve) => {
  //     img.onload = () => {
  //       const maxWidth = 142;
  //       const maxHeight = 135;
  //       const { width, height } = calculateAspectRatioFit(
  //         img.width,
  //         img.height,
  //         maxWidth,
  //         maxHeight
  //       );

  //       const canvas = document.createElement("canvas");
  //       const ctx = canvas.getContext("2d");
  //       canvas.width = width;
  //       canvas.height = height;

  //       ctx.drawImage(img, 0, 0, width, height);

  //       resolve(canvas.toDataURL("image/jpeg"));
  //     };
  //   });
  // };

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
                      src={file || userInfo?.profilePic || avatar}
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
                    {/* First Name */}
                    <div className="flex gap-2  w-3/4  flex-col">
                      <input
                        {...formik.getFieldProps("firstName")}
                        className={
                          formik.errors.firstName && formik.touched.firstName
                            ? styles.inputError
                            : `${styles.textbox} ${extend.textbox}`
                        }
                        type="text"
                        placeholder="First Name"
                      />
                      {formik.errors.firstName && formik.touched.firstName && (
                        <span className={styles.error}>
                          {formik.errors.firstName}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 w-3/4 flex-col">
                      <input
                        {...formik.getFieldProps("lastName")}
                        className={
                          formik.errors.lastName && formik.touched.lastName
                            ? styles.inputError
                            : `${styles.textbox} ${extend.textbox}`
                        }
                        type="text"
                        placeholder="Last Name"
                      />
                      {formik.errors.lastName && formik.touched.lastName && (
                        <span className={styles.error}>
                          {formik.errors.lastName}
                        </span>
                      )}
                    </div>
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
                  <div className="name  flex w-3/4 gap-10">
                    <input
                      {...formik.getFieldProps("city")}
                      className={`${styles.textbox} ${extend.textbox}`}
                      type="text"
                      placeholder="city"
                    />
                    <input
                      {...formik.getFieldProps("state")}
                      className={`${styles.textbox} ${extend.textbox}`}
                      type="text"
                      placeholder="state"
                    />
                    <div className="flex flex-col gap-2 w-3/4">
                      <input
                        {...formik.getFieldProps("pinCode")}
                        className={`${styles.textbox} ${extend.textbox}`}
                        type="text"
                        placeholder="pinCode"
                      />
                      {formik.errors.pinCode && formik.touched.pinCode && (
                        <span className={styles.error}>
                          {formik.errors.pinCode}
                        </span>
                      )}
                    </div>
                  </div>

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
                    <Link className="text-red-500" to="/">
                      Logout
                    </Link>
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
