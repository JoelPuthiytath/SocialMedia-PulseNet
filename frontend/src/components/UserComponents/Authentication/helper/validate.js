import * as yup from "yup";

const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
// min 5 characters, 1 upper case letter, 1 lower case letter, 1 numeric digit.
const schema = yup.object().shape({
  email: yup.string().email("Please enter a valid email").required("Required"),
  userName: yup
    .string()
    .matches(/^[a-zA-Z0-9_]+$/, "Invalid username format")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters"),
  password: yup
    .string()
    .min(5, "Password must be at least 5 characters")
    .matches(
      passwordRules,
      "Invalid password format, use a combination of uppercase, lowercase and numbers"
    ),
  confirm_pwd: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

export default schema;
