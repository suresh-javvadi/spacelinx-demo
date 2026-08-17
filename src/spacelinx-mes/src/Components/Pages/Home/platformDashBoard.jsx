import React from "react";
import { useNavigate } from "react-router-dom";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import "./PlatformDashboard.css";

const MODULES = [
  {
    label: "PLM",
    path: "/plm/parts",
    icon: AccountTreeIcon,
    desc: "Parts, BOMs & engineering changes",
  },
  {
    label: "Manufacturing",
    path: "/WorkOrders",
    icon: PrecisionManufacturingIcon,
    desc: "Work orders & assembly guides",
  },
  {
    label: "Procurement",
    path: "/procurement/purchaseorders",
    icon: ShoppingCartIcon,
    desc: "Purchase orders & requisitions",
  },
  {
    label: "Inventory",
    path: "/inventory/partsInventory",
    icon: Inventory2Icon,
    desc: "Stock, goods & movements",
  },
];

const PlatformDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="home-wrap">
      <div className="home-orbs" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
      </div>

      <section className="home-hero">
        <p className="home-eyebrow">WELCOME TO</p>
        <h1 className="home-wordmark">SARSPACE</h1>
        <p className="home-tagline">
          Manufacturing Execution &amp; Product Lifecycle Platform
        </p>
      </section>

      <section className="home-modules">
        {MODULES.map(({ label, path, icon: Icon, desc }) => (
          <button
            key={label}
            type="button"
            className="home-card"
            onClick={() => navigate(path)}
          >
            <span className="home-card-icon">
              <Icon fontSize="inherit" />
            </span>
            <span className="home-card-body">
              <span className="home-card-title">{label}</span>
              <span className="home-card-desc">{desc}</span>
            </span>
            <span className="home-card-go">
              Open
              <ArrowForwardIcon fontSize="inherit" />
            </span>
          </button>
        ))}
      </section>
    </div>
  );
};

export default PlatformDashboard;
