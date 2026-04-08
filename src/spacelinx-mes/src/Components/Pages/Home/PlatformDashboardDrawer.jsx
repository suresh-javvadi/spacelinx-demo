import React, { useState, useEffect, useContext } from "react";
import NoImagePNG from "../../../Assest/Images/NoImage.jpg";
import { Link, useNavigate } from "react-router-dom";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { ProductContext } from "../../../features/products/prodcutContext";
import { useTheme } from "@mui/material/styles";
import noImageDark from "../../../Assest/Images/noimagesmall/noimagedark.png";
import noImageLight from "../../../Assest/Images/noimagesmall/noimagelightmode.png";
import "./PlatformDashboard.css";
import { StyledDataGrid } from "../../StyledDataGrid/StyledDataGrid";

const PlatformDashboardDrawer = ({
  handleDrawerClose,
  selectedPlatform,
  products,
  GuideData,
  guidesLoading,
  loadingProducts,
}) => {
  const { selectedProductId, setSelectedProductId } =
    useContext(ProductContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const columns = [
    {
      field: "number",
      headerName: "Number",
      flex: 1,
      renderCell: ({ row, value }) => (
        <Link to={`/guides/${row.id}`} className="DataGridLinkCell">
          {value}
        </Link>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "part.name",
      headerName: "Part Name",
      flex: 1,
      valueGetter: (_value, row) => row.part?.name ?? "",
    },
    {
      field: "part.number",
      headerName: "Part Number",
      flex: 1,
      valueGetter: (_value, row) => row.part?.partNumber ?? "",
    },
    {
      field: "guideType",
      headerName: "Type",
      flex: 1,
      valueGetter: (_value, row) => row.guideType?.name ?? "",
    },
    {
      field: "platform",
      headerName: "Platform",
      flex: 1,
      valueGetter: (_value, row) => row.platform?.name ?? "",
    },
    {
      field: "version",
      headerName: "Version",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "Created Date",
      flex: 1,
      valueFormatter: (value) => {
        if (!value) return "";
        const date = new Date(value);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },
    },
  ];

  const handleProductClick = (product) => {
    setSelectedProductId(product.id);
    navigate("/product");
  };

  return (
    <>
      <div className="CreateFlyoutHeader">
        <h2>{selectedPlatform.name}</h2>
        <button onClick={handleDrawerClose}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      <div className="ProductsPlatformSection">
        <div className="Products">
          <h1>Products</h1>
        </div>
        <div className="ProductsInfo">
          <button
            className="ProductsInfoSideButtons"
            onClick={() => {
              const container = document.querySelector(
                ".ProductsScrollContainer"
              );
              container.scrollLeft -= 100;
            }}
          >
            <ion-icon name="chevron-back-outline"></ion-icon>
          </button>
          <div className="ProductsScrollContainer">
            {loadingProducts ? (
              <div className="loader-container">
                <Cliploader loading={loadingProducts} />
              </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  id={product.id}
                  className={
                    selectedProductId === product.id
                      ? "ProductsScrollingBoxHighlight"
                      : "ProductsScrollingBox ProductsScrollingBox2"
                  }
                  onClick={() => handleProductClick(product)}
                >
                  <div className="ProductsScrollingBoxInner">
                    <img
                      src={
                        product.image
                          ? product.image.filePath
                          : theme.palette.mode === "dark"
                          ? noImageDark
                          : noImageLight
                      }
                      alt={product.name}
                    />
                    <div className="productDetail">
                      <h3 className="ProductName">{product.name}</h3>
                      <p className="ProductGuideName">
                        {product.number || "Guide Unavailable"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <h1 className="NotAvailableMessage">No Products Available</h1>
            )}
          </div>

          <button
            className="ProductsInfoSideButtons"
            onClick={() => {
              const container = document.querySelector(
                ".ProductsScrollContainer"
              );
              container.scrollLeft += 100;
            }}
          >
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </button>
        </div>
      </div>
      <div className="Guides-Container">
        <div className="Guides">
          <h1>Guides</h1>
        </div>
        {guidesLoading ? (
          <div className="loader-container">
            <Cliploader loading={guidesLoading} />
          </div>
        ) : GuideData.length > 0 ? (
          <StyledDataGrid
            rows={GuideData}
            columns={columns}
            className="DataGrid"
            pageSize={5}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            loading={false}
          />
        ) : (
          <h1 className="NotAvailableMessage">No Guides Available</h1>
        )}
      </div>
    </>
  );
};

export default PlatformDashboardDrawer;
