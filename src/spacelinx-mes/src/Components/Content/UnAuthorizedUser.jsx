import { useMsal } from "@azure/msal-react";
import React from "react";
import "./UnAuthorizedUser.css";
import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import Header from "../UnAuthenticatedFiles/UAHeader/Header";
import xdlinxLogo from "../../Assest/Images/logos/poweredbyxdlinx.png";
import LockIcon from "@mui/icons-material/Lock";

const UnAuthorizedUser = ({ isUserActive, userAuthenticated }) => {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: "/",
    });
  };

  return (
    <>
      <Header />
      <div className="UnAuthorizedUserContainer">
        <div className="UnAuthorizedUserContent">
          <LockIcon className="lockIcon" />
          <h1>Access Denied</h1>
          <h2>Your account is not authorized to access this resource.</h2>

          <div>
            <Button
              variant="contained"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </div>

          <div className="footer">
            <img src={xdlinxLogo} alt="Powered by XDLINX Space LABS" />
            <p>
              Copyright &copy;{new Date().getFullYear()} XDLINX Space Labs Pvt
              Ltd Confidential and Proprietary.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnAuthorizedUser;
