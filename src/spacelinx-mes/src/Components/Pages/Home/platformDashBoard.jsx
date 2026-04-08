import React, { useState, useEffect, useContext } from "react";
import Globe from "../../../Assest/Images/GlobeImage.png";
import XDSATNS from "../../../Assest/Images/XDSAT-NS.png";
import XDSATNL from "../../../Assest/Images/XDSAT-NL.png";
import XDSATM200 from "../../../Assest/Images/XDSAT-M200.png";
import XDSATM400 from "../../../Assest/Images/XDSAT-M400.png";
import XDSATM600 from "../../../Assest/Images/XDSAT-M600.png";
import Drawer from "@mui/material/Drawer";
import "./PlatformDashboard.css";
import PlatformDashboardDrawer from "./PlatformDashboardDrawer";
import {
  fetchGuidePlatform,
  fetchPlatformLookUp,
  fetchProductPlatform,
} from "../../../services/platformService";
import { useTheme } from "@mui/material/styles";
import globeDarkMode from "../../../Assest/Images/platformdashboard/globeDarkModeV2.jpg";
import globeLightMode from "../../../Assest/Images/platformdashboard/globeLightMode.png";
import xdlinxLogoDark from "../../../Assest/Images/logos/xdlinxlogodarkmode.png";
import xdlinxLogoLight from "../../../Assest/Images/logos/xdlinxlogolightmode.png";
import { DrawerContext } from "../../../DrawerContext";
import "../../../features/features.css";
import "../../../features/products/product.css";
import ResizableDrawer from "../../ResizableDrawer/ResizableDrawer";

const PlatformDashboard = () => {
  const [drawerPlatformDashboard, setDrawerPlatformDashboard] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState({});
  const [platforms, setPlatforms] = useState([]);
  const [products, setProducts] = useState([]);
  const [GuideData, setGuideData] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const { isDrawerOpen } = useContext(DrawerContext);
  const Satillites = [
    { image: XDSATNS, name: "XDSAT NS", code: "xdsat_ns" },
    { image: XDSATNL, name: "XDSAT NL", code: "xdsat_nl" },
    { image: XDSATM200, name: "XDSAT M200", code: "xdsat_m200" },
    { image: XDSATM400, name: "XDSAT M400", code: "xdsat_m400" },
    { image: XDSATM600, name: "XDSAT M600", code: "xdsat_m600" },
  ];
  const theme = useTheme();
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const data = await fetchPlatformLookUp();
        const codes = data.map((platform) => platform.code);
        setPlatforms(data);
      } catch (error) {
        console.error("Error fetching platforms:", error);
      }
    };

    fetchPlatforms();
  }, []);
  const handleImageClick = async (platformCode) => {
    setLoadingProducts(true);
    setGuidesLoading(true);
    const platform = platforms.find((p) => p.code === platformCode);
    if (platform) {
      setSelectedPlatform(platform);
      setDrawerPlatformDashboard(true);
      if (platform.id) {
        try {
          const productData = await fetchProductPlatform(platform.id);
          if (productData) {
            setProducts(productData);
          }
          const guideData = await fetchGuidePlatform(platform.id);
          if (guideData) {
            setGuideData(guideData);
          }
        } catch (error) {
          console.error("Error fetching product details:", error);
        } finally {
          setLoadingProducts(false);
          setGuidesLoading(false);
        }
      } else {
        console.error("Platform ID is undefined or null:", platform);
      }
    } else {
      console.error("Platform not found for code:", platformCode);
    }
  };
  const handleDrawerClose = () => {
    setDrawerPlatformDashboard(false);
    setSelectedPlatform({});
  };
  return (
    <div className="PlatformMain">
      <div className="GlobeDiv">
        <img
          src={theme.palette.mode === "dark" ? globeDarkMode : globeLightMode}
          alt="Globe"
          className={`globeImage ${
            theme.palette.mode === "dark" ? "globeImageDark" : "globeImageLight"
          }`}
        />
      </div>
      <div className={isDrawerOpen ? "satellites-open" : "platformNamesDiv"}>
        {Satillites.map((platform, index) => (
          <div
            key={index}
            className="circle"
            onClick={() => handleImageClick(platform.code)}
          >
            <img src={platform.image} alt={platform.name} />
            <span>{platform.name.split(" ")[0]}</span>
            <p>{platform.name.split(" ")[1]}</p>
          </div>
        ))}
      </div>
      <div className="platformNamesDiv platformNamesDiv2">
        <div className="xdlinxspacelabs">
          <img
            src={
              theme.palette.mode === "dark" ? xdlinxLogoDark : xdlinxLogoLight
            }
            alt="xdlinx"
          />
        </div>
        <div className="Heading-Container">
          <div className="Heading-Child1">
            <h2>SATELLITE PLATFORMS</h2>
            <h3>FOR SPACE MISSIONS</h3>
          </div>

          <h6>POWERED BY ANTARIS</h6>
        </div>
      </div>
      <ResizableDrawer
        anchor="right"
        open={drawerPlatformDashboard}
        onClose={handleDrawerClose}
      >
        <PlatformDashboardDrawer
          handleDrawerClose={handleDrawerClose}
          selectedPlatform={selectedPlatform}
          products={products}
          GuideData={GuideData}
          guidesLoading={guidesLoading}
          loadingProducts={loadingProducts}
        />
      </ResizableDrawer>
    </div>
  );
};

export default PlatformDashboard;
