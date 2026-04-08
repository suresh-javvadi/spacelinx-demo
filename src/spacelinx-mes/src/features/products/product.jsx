import React, { useState, useEffect, useContext, useRef } from "react";
import { Drawer, Divider, Button } from "@mui/material";
import "./product.css";
import NewProduct from "./newProduct";
import Details from "./details";
import { HomeAlerts } from "../../features/AlertsContext/Alerts";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { fetchProduct } from "../../services/productService";
import Cliploader from "../../Components/Loaders/Cliploader";
import { fetchUniqueGuides } from "../../services/guideService";
import "../../features/features.css";
import BOM from "./bom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link, useNavigate } from "react-router-dom";
import noImageDark from "../../Assest/Images/noimagesmall/noimagedark.png";
import noImageLight from "../../Assest/Images/noimagesmall/noimagelightmode.png";
import { ProductContext } from "./prodcutContext";
import BillOfWorkorders from "./billofWorkorders";
import { useTheme } from "@mui/material/styles";
import noProductsDarkMode from "../../Assest/Images/noproducts/noproducts.png";
import noProductsLightMode from "../../Assest/Images/noproducts/noproductslightmode.png";
import { useUserContext } from "../../features/userContext/UserContext";
import { usePartDetailsDrawer } from "../admin/parts/PartDetailsContext";
import ResizableDrawer from "../../Components/ResizableDrawer/ResizableDrawer";
import { PERMISSIONS } from "../../constants/PagePermissions";

const Products = () => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const { selectedProductId, setSelectedProductId } =
    useContext(ProductContext);
  const [open, setOpen] = useState(false);
  const [allDataIsFetched, setAllDataIsFetched] = useState(true);
  const [createProductDrawerStatus, setCreateProductDrawerStatus] =
    useState(false);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProductData, setSelectedProductData] = useState(null);
  const [productId, setProductId] = useState(selectedProductId);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isNewProductAdded, setIsNewProductAdded] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    if (panel === "workorders") {
      if (hasPermission(PERMISSIONS.PRODUCTS.WORKORDERS.VIEW)) {
        setExpandedAccordion(isExpanded ? panel : false);
      } else {
        Alert("You do not have access to view workorders!", "warning");
      }
    }

    if (panel === "bom") {
      if (hasPermission(PERMISSIONS.PRODUCTS.BOM.VIEW)) {
        setExpandedAccordion(isExpanded ? panel : false);
      } else {
        Alert("You do not have access to view Bill of Materials!", "warning");
      }
    }
  };

  const navigate = useNavigate();
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  useEffect(() => {
    return () => {
      setSelectedProductId(null);
    };
  }, [navigate]);

  const handleCreateProductDrawerClose = () => {
    setCreateProductDrawerStatus(false);
  };
  const theme = useTheme();
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    setAllDataIsFetched(true);
    try {
      const productsData = await fetchProduct();
      const guideData = await fetchUniqueGuides();
      if (productsData.length > 0) {
        const productWithGuideInfo = productsData.map((product) => {
          const updatedData = guideData.filter(
            (guide) => product.partId === guide.partId
          );
          return {
            ...product,
            guideData: updatedData[0],
          };
        });
        const sortedProducts = productWithGuideInfo.sort(
          (a, b) => b.sequence - a.sequence
        );
        setProducts(sortedProducts);
        const newlyAddedProduct = sortedProducts[0];
        setSelectedProductData(newlyAddedProduct);
        if (selectedProductId) {
          setProductId(selectedProductId);
        } else {
          setProductId(newlyAddedProduct.id);
        }
        setIsNewProductAdded(true);
      } else {
        setProducts([]);
        Alert("No products found!", "success");
      }
    } catch (error) {
      Alert("Error fetching data!", "error");
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const filterProducts = (products, query) => {
    return products.filter((product) =>
      product?.name?.toLowerCase().includes(query.toLowerCase())
    );
  };

  useEffect(() => {
    if (selectedProductData && !loadingData) {
      positionTheStep(isNewProductAdded);
      setIsNewProductAdded(false);
    }
  }, [selectedProductData, loadingData]);

  const positionTheStep = (isNew) => {
    setTimeout(() => {
      const container = document.querySelector(".ProductsScrollContainer");
      const selectedProduct = document.getElementById(selectedProductData?.id);

      if (container && selectedProduct) {
        const containerRect = container.getBoundingClientRect();
        const selectedProductRect = selectedProduct.getBoundingClientRect();

        let scrollOffset;
        if (isNew) {
          scrollOffset = 0;
        } else {
          scrollOffset = selectedProductRect.left - containerRect.left;
        }
        const scrollLeft = container.scrollLeft + scrollOffset;

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
        setScrollPosition(scrollLeft);
      }
    }, 200);
  };

  useEffect(() => {
    const container = document.querySelector(".ProductsScrollContainer");

    setTimeout(() => {
      if (container) {
        setScrollPosition(container.scrollLeft);
      }
    }, 500);
  }, [scrollPosition]);

  useEffect(() => {
    if (productId) {
      setSelectedProductData(products.find((item) => item.id === productId));
    } else {
      setSelectedProductData(products?.find((product, index) => index === 0));
    }
  }, [products, productId]);

  return (
    <div className="Product">
      <div className="ProductChildrenHeader">
        <p className="PageHeader">Products</p>
        <div>
          <input
            type="search"
            className="ProductSearchBar SearchBar"
            placeholder="Search Here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            onClick={() => {
              if (hasPermission(PERMISSIONS.PRODUCTS.MODIFY)) {
                setCreateProductDrawerStatus(true);
              } else {
                Alert("You do not have access to create..!", "warning");
              }
            }}
          >
            + Add new
          </Button>
        </div>{" "}
      </div>
      <div className="Product">
        {loadingData ? (
          <div className="loader-container">
            <Cliploader loading={loadingData} />
          </div>
        ) : products?.length === 0 ? (
          <>
            <div className="NoProductsMessage">
              <p>Currently, there are no Products</p>
              <p>exist in system</p>
              <Button
                onClick={() => {
                  if (hasPermission(PERMISSIONS.PRODUCTS.MODIFY)) {
                    setCreateProductDrawerStatus(true);
                  } else {
                    Alert("You do not have access to create..!", "warning");
                  }
                }}
              >
                Create Product
              </Button>
              <img
                src={
                  theme.palette.mode === "dark"
                    ? noProductsDarkMode
                    : noProductsLightMode
                }
                alt="no products"
              />
            </div>
          </>
        ) : (
          <>
            <div className="ProductsSection">
              <div className="ProductsInfoContainer">
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
                  <div className="ProductsInfo">
                    {filterProducts(products, searchQuery).map(
                      (product, index) => {
                        return (
                          <div
                            id={product.id}
                            key={product.id}
                            className={
                              selectedProductData?.id === product?.id
                                ? "ProductsScrollingBoxHighlight"
                                : "ProductsScrollingBox"
                            }
                            onClick={() => {
                              if (allDataIsFetched) {
                                Alert(
                                  "The Data is Fetching Please Wait..",
                                  "error"
                                );
                              } else {
                                setProductId(product.id);
                              }
                            }}
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
                                className="product-image"
                                  alt={product.name}
                              />
                              <div className="ProductGuideName">
                                <p className="ProductName">{product.name}</p>/
                                <p className="ProductGuideName">
                                  {product?.guideData?.number ||
                                    "Guide UnAvailable"}
                                </p>
                              </div>
                            </div>
                            <p className="ProductNumber">
                              {products.findIndex(
                                (item) => item.id === product.id
                              ) + 1}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
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

            {loadingData ? (
              <Cliploader loading={loadingData} />
            ) : (
              <div className="ProductDetailsHome">
                {" "}
                <div className="ProductNameNumber">
                  <h2>Product </h2>:<p>{selectedProductData?.name}</p>
                </div>
                <Divider orientation="vertical" className="ProductDivider" />
                <div className="ProductNameNumber">
                  <h2>Guide </h2>:
                  <div>
                    <p>{selectedProductData?.guideData?.name}</p> /
                    <Link
                      to={
                        hasPermission(PERMISSIONS.GUIDES.VIEW)
                          ? `/guides/${selectedProductData?.guideData?.id}`
                          : "#"
                      }
                      className={`AppHyperLink ProductGuideNameNumberLink ${
                        !hasPermission(PERMISSIONS.GUIDES.VIEW)
                          ? "disabled-link"
                          : ""
                      }`}
                      onClick={(e) => {
                        if (!hasPermission(PERMISSIONS.GUIDES.VIEW)) {
                          e.preventDefault();
                          Alert(
                            "You do not have access to view guides!",
                            "warning"
                          );
                        }
                      }}
                    >
                      {selectedProductData?.guideData?.number}
                    </Link>
                  </div>
                </div>
                <Divider orientation="vertical" className="ProductDivider" />
                <div className="ProductNameNumber">
                  <h2>Part </h2>:
                  <div
                    title={`${selectedProductData?.part?.partNumber} / ${selectedProductData?.part?.name}`}
                    className={`AppHyperLink ${
                      !hasPermission(PERMISSIONS.PARTS.VIEW)
                        ? "disabled-link"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        hasPermission(PERMISSIONS.PARTS.VIEW) &&
                        selectedProductData?.part
                      ) {
                        openPartDetailsDrawer(selectedProductData.part);
                      } else if (!hasPermission(PERMISSIONS.PARTS.VIEW)) {
                        Alert(
                          "You do not have access to view part details!",
                          "warning"
                        );
                      }
                    }}
                  >
                    <p>{selectedProductData?.part?.partNumber}</p>/
                    <p>{selectedProductData?.part?.name} </p>
                  </div>
                </div>
                <Divider orientation="vertical" className="ProductDivider" />{" "}
                <div className="ProductNameNumber">
                  <h2>Platform </h2>:<p>{selectedProductData.platform?.name}</p>
                </div>
                <Divider orientation="vertical" className="ProductDivider" />{" "}
                <div
                  className={`AppHyperLink ProductViewDetails ${
                    !hasPermission(PERMISSIONS.PRODUCTS.VIEW)
                      ? "disabled-link"
                      : ""
                  }`}
                  onClick={() => {
                    if (hasPermission(PERMISSIONS.PRODUCTS.VIEW)) {
                      setOpen(true);
                    } else {
                      Alert(
                        "You do not have access to view product details!",
                        "warning"
                      );
                    }
                  }}
                >
                  <p>View Details</p>
                </div>
              </div>
            )}
            {loadingData ? (
              <Cliploader
                loading={loadingData}
                className="ProductDetailsLoader"
              />
            ) : (
              <div className="ProductDetails">
                <div className="ProductsBillOfGuides">
                  <Accordion
                    expanded={expandedAccordion === "workorders"}
                    onChange={handleAccordionChange("workorders")}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon className="AppHyperLink" />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                    >
                      <p className="ProductsAccordionHeader">Workorders</p>
                    </AccordionSummary>
                    <AccordionDetails>
                      {hasPermission(PERMISSIONS.PRODUCTS.WORKORDERS.VIEW) ? (
                        <BillOfWorkorders
                          setAllDataIsFetched={setAllDataIsFetched}
                          partId={selectedProductData?.partId}
                          productId={selectedProductData?.id}
                        />
                      ) : (
                        <p>You do not have permission to view workorders.</p>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </div>
                <div className="ProductsBom">
                  <Accordion
                    expanded={expandedAccordion === "bom"}
                    onChange={handleAccordionChange("bom")}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon className="AppHyperLink" />}
                      aria-controls="panel2-content"
                      id="panel2-header"
                    >
                      <p className="ProductsAccordionHeader">
                        Bill of Materials
                      </p>
                    </AccordionSummary>
                    <AccordionDetails>
                      {hasPermission(PERMISSIONS.PRODUCTS.BOM.VIEW) ? (
                        <BOM
                          setAllDataIsFetched={setAllDataIsFetched}
                          partId={selectedProductData?.partId}
                        />
                      ) : (
                        <p>
                          You do not have permission to view Bill of Materials.
                        </p>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ResizableDrawer
        anchor="right"
        open={createProductDrawerStatus}
        onClose={handleCreateProductDrawerClose}
      >
        <NewProduct
          setMainProductsLoadingData={setLoadingData}
          setCreateProductDrawerStatus={setCreateProductDrawerStatus}
          handleCloseClick={handleCreateProductDrawerClose}
          fetchProductsData={() => {
            fetchData();
            setIsNewProductAdded(true);
          }}
          setSearchQuery={setSearchQuery}
        />
      </ResizableDrawer>
      <ResizableDrawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        {selectedProductData && (
          <Details
            selectedProduct={selectedProductData}
            setProductId={setProductId}
            setMainProductLoadingData={setLoadingData}
            setOpen={setOpen}
            products={products}
            fetchMainProductsData={fetchData}
          />
        )}
      </ResizableDrawer>
      <div className="ProductAlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default Products;
