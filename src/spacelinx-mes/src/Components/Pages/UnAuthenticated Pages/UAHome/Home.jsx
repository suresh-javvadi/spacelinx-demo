import React from "react";
import { Card, CardActions, CardContent, Box, Typography } from "@mui/material";
import { useMsal } from "@azure/msal-react";
import spacelinxLogo from "../../../../Assest/Images/CompanyLogo_DarkMode.svg";
import xdlinxLogo from "../../../../Assest/Images/logos/poweredbyxdlinxDark.png";
import microsoftLogo from "../../../../Assest/Images/loginpage/MicrosoftLogo.png";
import "./Home.css";

const Home = () => {
  const { instance } = useMsal();

  const handleMLogin = () => {
    const redirectPath =
      sessionStorage.getItem("postLoginRedirect") || window.location.pathname;

    instance.loginRedirect({
      scopes: ["user.read"],
      redirectStartPage: redirectPath,
    });
  };

  return (
    <div className="Main">
      <div className="ContentWrapper">
        <img src={spacelinxLogo} alt="spacelinx" className="Logos" />
        <img src={xdlinxLogo} alt="xdlinx" className="xdlinxlogo" />
        <div className="SignInOptions2">
          <button className="GoogleButton" onClick={handleMLogin}>
            <img src={microsoftLogo} alt="login" />
            <p>Login with Microsoft</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
