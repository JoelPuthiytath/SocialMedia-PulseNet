import * as yup from "yup";

const ProfileSchema = yup.object().shape({
  email: yup.string().email("Please enter a valid email").required("Required"),
  userName: yup
    .string()
    .matches(/^[a-zA-Z0-9_]+$/, "Invalid username format")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  pinCode: yup
    .number()
    .typeError("Pin code must be a number")
    .required("Pin code is required"),
});

export default ProfileSchema;
