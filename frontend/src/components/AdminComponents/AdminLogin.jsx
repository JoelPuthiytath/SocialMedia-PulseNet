import React, { useState } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBInput,
} from "mdb-react-ui-kit";
import { useAdminLoginMutation } from "../../slices/AdminApiSlice";
import { useDispatch } from "react-redux";
import { adminSetCredentials } from "../../slices/AdminAuthSlice";
import logo from "../../assets/img/pulseNet.png";
import { useNavigate } from "react-router-dom";
const AdminLogin = () => {
  const [AdminLogin] = useAdminLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      console.log(email, password);
      const data = await AdminLogin({ email, password }).unwrap();
      console.log(data, "data");
      dispatch(adminSetCredentials(data));
      navigate("admin/home");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MDBContainer className="my-5">
      <MDBCard style={{ minHeight: "80vh" }}>
        <MDBRow className="g-0 d-flex align-items-center mt-5 p-3">
          <MDBCol md="4">
            <MDBCardImage
              src={logo}
              alt="phone"
              className="rounded-t-5 rounded-tr-lg-0"
              fluid
            />
          </MDBCol>

          <MDBCol md="8">
            <MDBCardBody>
              <MDBInput
                wrapperClass="mb-4"
                label="Email address"
                id="form1"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Password"
                id="form2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <MDBBtn className="mb-4 w-100" onClick={handleSubmit}>
                Sign in
              </MDBBtn>
            </MDBCardBody>
          </MDBCol>
        </MDBRow>
      </MDBCard>
    </MDBContainer>
  );
};

export default AdminLogin;
