import React from "react";
import "./styles/NotFound.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div id="notfound">
      {/* {<Toaster position="top-center" reverseOrder={false}></Toaster>} */}
      <div className="notfound">
        <div className="notfound-404">
          <h1>Oops!</h1>
          <h2>403 - You are restricted</h2>
        </div>
        <button
          onClick={() => {
            navigate("/username");
          }}
        >
          Go TO Homepage
        </button>
      </div>
    </div>
  );
};

export default NotFound;
