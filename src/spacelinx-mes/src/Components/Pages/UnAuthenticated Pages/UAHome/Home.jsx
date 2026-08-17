import React from "react";
import { Card, CardActions, CardContent, Box, Typography } from "@mui/material";
import { useMsal } from "@azure/msal-react";
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
        <div className="LoginCard">
          <div className="BrandWordmarkLogin" aria-label="SARSPACE">
            SAR<span className="BrandWordmarkLoginAccent">SPACE</span>
          </div>
          <p className="LoginTagline">
            Manufacturing Execution &amp; Product Lifecycle Platform
          </p>
          <div className="SignInOptions2">
            <button className="GoogleButton" onClick={handleMLogin}>
              <img src={microsoftLogo} alt="" />
              <span>Sign in with Microsoft</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
