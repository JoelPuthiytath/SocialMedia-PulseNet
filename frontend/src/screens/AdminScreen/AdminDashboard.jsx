import { useEffect, useState } from "react";
import {
  useListUsersMutation,
  usePatchBlockMutation,
  useRemoveUsersMutation,
} from "../../slices/AdminApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { getUsers, setUsers } from "../../slices/UserSlice";
import { DeleteUser } from "../../slices/AuthSlice";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import Loader from "../../loader/GridLoader";
import { Typography } from "@mui/material";

const AdminDashboard = () => {
  const [ListUsers, { isLoading }] = useListUsersMutation();
  // const [RemoveUsers] = useRemoveUsersMutation();
  const [patchBlock] = usePatchBlockMutation();
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.users);

  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filteredUser, setFilteredUser] = useState([]);
  useEffect(() => {
    getAllUsers();
  }, []);

  async function getAllUsers() {
    try {
      const data = await ListUsers().unwrap();
      console.log(data, "users data");
      dispatch(getUsers(data));
      setAllUsers(data);
      setFilteredUser(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error(error?.data?.message || error.error);
    }
  }

  // const deleteUsers = async (id) => {
  //   try {
  //     const res = await RemoveUsers(id).unwrap();
  //     console.log(res, "just checking");
  //     dispatch(DeleteUser({ ...res }));
  //     console.log("i am after delete user");
  //     const data = users.filter((item) => item._id !== id);
  //     console.log("after filerer");
  //     console.log(data);
  //     setAllUsers(data);
  //     toast.success("user deleted successfully");
  //   } catch (err) {
  //     console.log(err);
  //     toast.error(err?.data?.message || err.error);
  //   }
  // };

  const handleBlockUser = async (userId) => {

    const data = await patchBlock({ userId }).unwrap();
   
    if (data.success) {
      dispatch(getUsers(data.user));
      const updatedUsers = allUsers.map((user) =>
        user._id === data.user._id ? data.user : user
      );

      setAllUsers(updatedUsers);
    }
  };

  const filteredData = (data, userData) => {

  
    return userData.filter((item) =>
      item?.userName?.toLowerCase()?.includes(data.toLowerCase())
    );
  };

  return (
    <>
      {isLoading ? (
        <>
          <div
            style={{
              height: "50vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loader size={30} color="	#0d98ba" />
          </div>
        </>
      ) : (
        <>
          <div className="d-flex flex-column align-items-center  w-100">
            <Typography variant="h1" fontWeight="bold" marginTop={"1rem"}>
              User Management
            </Typography>
            <ToastContainer />
            <div className="container">
              <button
                className="btn btn-success mb-3 float-right"
                onClick={() => navigate("/admin/create")}
              >
                Create +
              </button>
              <input
                className="my-3 p-1 float-left"
                type="search"
                placeholder="search here..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  const data = filteredData(searchText, filteredUser);
                  setAllUsers(data);
                }}
              ></input>
            </div>

            {users ? (
              <>
                <table className="table table-bordered text-center mx-5">
                  <thead style={{ backgroundColor: "aqua" }}>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">@username</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="colgroup">Options</th>
                    </tr>
                  </thead>
                  <tbody className="table-dark">
                    {allUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{`${user.firstName} ${user.lastName}`}</td>
                        <td>{user.userName}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                          {user.blocked ? (
                            <>
                              <button
                                className="btn btn-sm btn-info ms-2"
                                onClick={() => handleBlockUser(user._id)}
                              >
                                Unblock
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm btn-danger ms-2"
                                onClick={() => handleBlockUser(user._id)}
                              >
                                Block
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <>
                <div className="text-center">
                  <h3>User not found</h3>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default AdminDashboard;
