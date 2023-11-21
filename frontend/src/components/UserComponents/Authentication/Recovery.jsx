import { useEffect, useRef, useState } from "react";
import styles from "./styles/Username.module.css";
import toast, { Toaster } from "react-hot-toast";

import { useSelector } from "react-redux";
// import { toast } from "react-toastify";

import {
  useGenerateOTPMutation,
  useOtpVerifyMutation,
  useRegisterMailMutation,
} from "../../../slices/UsersApiSlice";
import { useNavigate } from "react-router-dom";

const Recovery = () => {
  const [OTP, setOTP] = useState();
  const { users } = useSelector((state) => state.users);
  const [generateOTP] = useGenerateOTPMutation();
  const [registerMail] = useRegisterMailMutation();
  const navigate = useNavigate();
  const hasEffectRun = useRef(false);
  const [otpVerify] = useOtpVerifyMutation();
  const { userName, email } = users;
  const [showResendButton, setShowResendButton] = useState(false);

  async function otpsender() {
    generateOTP(userName).then(async (res) => {
      if (!res?.data?.code) return toast.error("Problem while generating OTP!");
      try {
        let text = `Your Password Recovery OTP is ${res?.data?.code}. Verify and recover your password.`;
        await registerMail({
          username: userName,
          userEmail: email,
          text,
          subject: "Password Recovery OTP",
        }).then((result) => {
          console.log(result);
          if (result?.data?.success) {
            return toast.success("OTP has been sent to your email!");
          }
          return toast.error("Problem while sending OTP!");
        });
      } catch (error) {
        console.log(error);
        toast.error(error);
      }
    });
    hasEffectRun.current = true;
  }

  useEffect(() => {
    if (!hasEffectRun.current) {
      console.log("checking");
      otpsender();
    }

    const timer = setTimeout(() => {
      setShowResendButton(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(userName, OTP);
    let code = OTP;
    try {
      const data = {
        userName,
        code,
      };
      const res = await otpVerify(data);
      console.log(res.data);
      if (res?.data?.success) {
        toast.success("Verify Successfully!");
        return navigate("/reset");
      }
      return toast.error("Wrong OTP! Check email again!");
    } catch (error) {
      console.log(error);
    }
  };

  const resendOTP = () => {
    otpsender();
  };

  return (
    <div className="container mx-auto">
      {<Toaster position="top-center" reverseOrder={false}></Toaster>}
      <div className="flex justify-center items-center h-screen">
        <div className={styles.glass}>
          <div className="title flex flex-col items-center">
            <h6 className="text-3xl font-bold">Recovery </h6>
            <span className="py-1 w-2/3 text-center text-gray-500">
              Enter OTP to recover password.
            </span>
          </div>

          <form className="py-10" onSubmit={submitHandler}>
            <div className="textbox flex flex-col items-center gap-6">
              <div className="input text-center">
                <span className="py-4 text-sm text-left text-gray-500">
                  Enter 6 digit OTP send to your email address.
                </span>
                <input
                  className={styles.textbox}
                  type="text"
                  onChange={(e) => setOTP(e.target.value)}
                  placeholder="OTP"
                />
              </div>
              <button className={styles.btn} type="submit">
                Next
              </button>
            </div>
            <div className="text-center py-4">
              <span className="text-black-500">
                Can't get OTP ?{"  "}
                {showResendButton && (
                  <button className="text-red-500" onClick={resendOTP}>
                    Resend OTP
                  </button>
                )}
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Recovery;
