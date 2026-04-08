import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./admin.css";
import { ClipLoader } from "react-spinners";
import { fetchMasterDataCount } from "../../services/dashboardService";
import Parts from "../../Assest/Images/masterdata/Parts.png";
import Tools from "../../Assest/Images/masterdata/Tools.png";
import Machines from "../../Assest/Images/masterdata/Machines.png";
import News from "../../Assest/Images/masterdata/News.png";
import Locations from "../../Assest/Images/masterdata/Locations.png";

const Admin = () => {
  const [counts, setCounts] = useState({
    partsCount: null,
    toolsCount: null,
    machinesCount: null,
    newsCount: null,
    locationCount: null,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          partsCount,
          toolsCount,
          machinesCount,
          newsCount,
          locationCount,
        } = await fetchMasterDataCount();

        setCounts({
          partsCount,
          toolsCount,
          machinesCount,
          newsCount,
          locationCount,
        });

        setLoadingData(false);
      } catch (error) {
        console.error("Error fetching count data", error);
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin">
      <p className="PageHeader">Master Data</p>
      <div className="admin-container">
        {loadingData ? (
          <div className="loader-container">
            <ClipLoader
              color={"#009cbb"}
              loading={loadingData}
              size={30}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        ) : (
          <>
            <Link to="/masterdata/parts" className="masterdata-card">
              <h1 className="number">{counts.partsCount}</h1>
              <h2 className="masterdata-text">Parts</h2>
              <img src={Parts} alt="Parts" />
            </Link>
            <Link to="/masterdata/tools" className="masterdata-card">
              <h1 className="number">{counts.toolsCount}</h1>
              <h2 className="masterdata-text">Tools</h2>
              <img src={Tools} alt="Tools" />
            </Link>
            <Link to="/masterdata/machines" className="masterdata-card">
              <h1 className="number">{counts.machinesCount}</h1>
              <h2 className="masterdata-text">Machines</h2>
              <img src={Machines} alt="Machines" />
            </Link>
            <Link to="/masterdata/news" className="masterdata-card">
              <h1 className="number">{counts.newsCount}</h1>
              <h2 className="masterdata-text">News</h2>
              <img src={News} alt="News" />
            </Link>
            <Link to="/masterdata/locations" className="masterdata-card">
              <h1 className="number">{counts.locationCount}</h1>
              <h2 className="masterdata-text">Locations</h2>
              <img src={Locations} alt="Locations" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
