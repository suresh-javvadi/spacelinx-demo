import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../../Pages/UnAuthenticated Pages/UAHome/Home";

const Content = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />

      {/* 🔥 Catch ALL other paths and SHOW login (NO redirect) */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};

export default Content;
