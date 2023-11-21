import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBTypography,
  MDBIcon,
} from "mdb-react-ui-kit";
import { useEffect, useState } from "react";
import FormContainer from "../../components/FormContainer";
import { Form, Button } from "react-bootstrap";
import {
  useEditUserMutation,
  useUpdateUserMutation,
} from "../../slices/AdminApiSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AdminUserEdit = () => {
  const { id } = useParams();
  const [EditUser] = useEditUserMutation();
  const [UpadateUser] = useUpdateUserMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const fetchUserDetails = async () => {
    try {
      const response = await EditUser(id).unwrap();
      console.log("Response from EditUser:", response); // Add this line
      setFirstName(response.firstName);
      setLastName(response.lastName);
      setUserName(response.userName);
      setEmail(response.email);
      setAddress(response.address);
      setPhone(response.phone);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await UpadateUser({
        id: id,
        firstName,
        lastName,
        userName,
        address,
        email,
        phone,
      }).unwrap();
      toast.success("User updated successfully");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  return (
    <section className="vh-100" style={{ backgroundColor: "#f4f5f7" }}>
      <MDBContainer className="py-5 h-100">
        <MDBRow className="justify-content-center align-items-center h-100">
          <MDBCol lg="12" className="mb-4 mb-lg-0">
            <MDBCard className="mb-3" style={{ borderRadius: ".5rem" }}>
              <MDBRow className="g-0">
                <MDBCol
                  md="4"
                  className="gradient-custom text-center text-white"
                  style={{
                    borderTopLeftRadius: ".5rem",
                    borderBottomLeftRadius: ".5rem",
                  }}
                >
                  <MDBTypography tag="h5">{firstName}</MDBTypography>
                  <MDBIcon far icon="edit mb-5" />
                </MDBCol>
                <MDBCol md="8">
                  <FormContainer>
                    <h4 className="text-center mt-2">Edit User</h4>
                    <Form onSubmit={submitHandler}>
                      <Form.Group className="my-2" controlId="name">
                        <Form.Label>firstName </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="my-2" controlId="name">
                        <Form.Label>lastName </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="my-2" controlId="name">
                        <Form.Label>UserName </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter username"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="my-2" controlId="email">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="my-2" controlId="email">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="my-2" controlId="phone">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter PhoneNumber"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </Form.Group>
                      <Button
                        type="submit"
                        variant="primary"
                        className="mt-3 mb-3"
                      >
                        Update
                      </Button>
                    </Form>
                  </FormContainer>
                </MDBCol>
              </MDBRow>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </section>
  );
};

export default AdminUserEdit;
