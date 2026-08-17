import { Divider } from "@mui/material";
import { PieChart } from "@mui/x-charts";
import React, { useContext, useEffect, useState } from "react";
import "./PMDashBoard.css";
import { fetchBuild } from "../../../services/buildService";
import { fetchWorkOrderWithNoDependency } from "../../../services/WOrderService";
import { fetchWorkOrder } from "../../../services/WOrderService";
import { fetchProduct } from "../../../services/productService";
import WorkOrderTimeLine from "./WorkOrderTimeLine";
import { Link, useNavigate } from "react-router-dom";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { ProductContext } from "../../../features/products/prodcutContext";

const PMDashBoard = () => {
  const { selectedProductId, setSelectedProductId } =
    useContext(ProductContext);
  const [productData, setProductData] = useState([]);
  const [buildData, setBuildData] = useState([]);
  const [manufacturingOrderData, setManufacturingOrderData] = useState([]);
  const [workOrderData, setWorkOrderData] = useState([]);
  const [workOrderDataWithPartRef, setWorkOrderDataWithPartRef] = useState([]);
  const [loadingProductData, setLoadingProductData] = useState(true);
  const [loadingBuildData, setLoadingBuildData] = useState(true);
  const [loadingManufacturingOrderData, setLoadingManufacturingOrderData] =
    useState(true);
  const [loadingWorkOrderData, setLoadingWorkOrderData] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductData();
    fetchBuildData();
    fetchManufacturingOrderData();
    fetchWorkOrderData();
  }, []);

  const fetchProductData = async () => {
    setLoadingProductData(true);
    try {
      const data = await fetchProduct();
      if (data) {
        const sortedProducts = [...data].sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        );
        setProductData(sortedProducts);
        setSelectedProductId(sortedProducts[0]?.id);
        setLoadingProductData(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBuildData = async () => {
    setLoadingBuildData(true);
    try {
      const data = await fetchBuild();
      if (data) {
        setBuildData(data);
        setLoadingBuildData(false);
      } else {
        setBuildData([]);
        setLoadingBuildData(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchManufacturingOrderData = async () => {
    setLoadingManufacturingOrderData(true);
    try {
      const data = await fetchWorkOrder();
      if (data) {
        setManufacturingOrderData(data);
        setLoadingManufacturingOrderData(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchWorkOrderData = async () => {
    setLoadingWorkOrderData(true);
    try {
      const data = await fetchWorkOrderWithNoDependency();
      if (data) {
        setLoadingWorkOrderData(false);
        setWorkOrderData(data);
        const addedPartRef = data?.map((workOrder) => {
          const manufacturingOrder = manufacturingOrderData.find(
            (order) => order.id === workOrder.manufacturingOrderId
          );
          return {
            ...workOrder,
            part: manufacturingOrder?.part,
          };
        });
        setWorkOrderDataWithPartRef(addedPartRef);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleProductClick = (productId) => {
    setSelectedProductId(productId);
    navigate(`/product`);
  };

  return (
    <div className="PMDashBoardPageMainDiv">
      <p className="PMDashBoardPageMainDivInner">Dashboard</p>
      <div className="PMDashBoardHeader">
        <Link className="PMDashBoardHeaderInnerDiv" to="/product">
          <p className="PMDashBoardHeaderInnerDivP1">PRODUCTS</p>
          {loadingProductData ? (
            <div className="PMDashBoardLoader-Container">
              <ClipLoader loading={true} />
            </div>
          ) : (
            <p className="PMDashBoardHeaderInnerDivP2">{productData.length}</p>
          )}
        </Link>
        <Link className="PMDashBoardHeaderInnerDiv" to="/product">
          <p className="PMDashBoardHeaderInnerDivP1">BUILDS</p>
          {loadingBuildData ? (
            <div className="PMDashBoardLoader-Container">
              <Cliploader loading={true} />
            </div>
          ) : (
            <p className="PMDashBoardHeaderInnerDivP2">{buildData.length}</p>
          )}
        </Link>
        <Link className="PMDashBoardHeaderInnerDiv" to="/manufacturingOrders">
          <p className="PMDashBoardHeaderInnerDivP1">MANUFACTURING ORDERS</p>
          {loadingManufacturingOrderData ? (
            <div className="PMDashBoardLoader-Container">
              <Cliploader loading={true} />
            </div>
          ) : (
            <p className="PMDashBoardHeaderInnerDivP2">
              {manufacturingOrderData.length}
            </p>
          )}
        </Link>
        <Link className="PMDashBoardHeaderInnerDiv" to="/manufacturingOrders">
          <p className="PMDashBoardHeaderInnerDivP1">WORK ORDERS</p>
          {loadingWorkOrderData ? (
            <div className="PMDashBoardLoader-Container">
              <Cliploader loading={true} />
            </div>
          ) : (
            <p className="PMDashBoardHeaderInnerDivP2">
              {workOrderData.length}
            </p>
          )}
        </Link>
      </div>

      <div className="ProductsSection">
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
            {loadingProductData ? (
              <Cliploader loading={true} />
            ) : (
              <div className="ProductsInfo">
                {productData.map((product, index) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className={
                      selectedProductId === product.id
                        ? "ProductsScrollingBoxHighlight"
                        : "ProductsScrollingBox"
                    }
                  >
                    <div className="ProductsScrollingBoxInner">
                      <img
                        src={
                          product.imageUrl
                            ? product.imageUrl.startsWith("http")
                              ? product.imageUrl
                              : product.image.filePath
                            : "https://t4.ftcdn.net/jpg/04/99/93/31/360_F_499933117_ZAUBfv3P1HEOsZDrnkbNCt4jc3AodArl.jpg"
                        }
                      />
                      <div>
                        <p className="ProductName">{product.productName}</p> /
                        <p className="ProductGuideName">
                          {product.guideNumber || "Guide Unavailable"}
                        </p>
                      </div>
                    </div>
                    <p className="ProductNumber">{index + 1}</p>
                  </div>
                ))}
              </div>
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

      <div className="PMDashBoardBody1">
        <div className="PMDashBoard1Inner">
          <div>
            <p>Builds</p>
            <ion-icon name="filter-outline"></ion-icon>
          </div>
          <PieChart
            colors={[
              "rgba(165, 180, 252, 1)",
              "rgba(99, 102, 241, 1)",
              "rgba(99, 102, 241, 1)",
            ]}
            series={[
              {
                data: [
                  {
                    id: 0,
                    value: buildData?.filter(
                      (item) => item.status === "Completed"
                    ).length,
                    label: "Completed",
                  },
                  {
                    id: 1,
                    value: buildData.filter(
                      (item) => item.status === "InProgress"
                    ).length,
                    label: "In Progress",
                  },
                  {
                    id: 2,
                    value: buildData.filter(
                      (item) => item.status === "Assigned"
                    ).length,
                    label: "Assigned",
                  },
                  {
                    id: 3,
                    value: buildData.filter((item) => item.status === "New")
                      .length,
                    label: "Not Assigned",
                  },
                ],
              },
            ]}
            slotProps={{
              legend: {
                hidden: false,
                direction: "column",
                labelStyle: {
                  fontSize: 12,
                  fill: "rgba(143, 143, 143, 1)",
                },
                position: {
                  vertical: "middle",
                  horizontal: "right",
                },
                itemMarkWidth: 15,
                itemMarkHeight: 6,
              },
            }}
            padding="0"
            height={140}
          />
        </div>
        <Divider orientation="vertical" style={{ height: "150px" }} />
        <div className="PMDashBoard1Inner">
          <div>
            <p>Manufacturing Orders</p>
            <ion-icon name="filter-outline"></ion-icon>
          </div>
          <PieChart
            colors={[
              "rgba(165, 180, 252, 1)",
              "rgba(99, 102, 241, 1)",
              "rgba(99, 102, 241, 1)",
            ]}
            series={[
              {
                data: [
                  {
                    id: 0,
                    value: manufacturingOrderData.filter(
                      (item) => item.status === "Completed"
                    ).length,
                    label: "Completed",
                  },
                  {
                    id: 1,
                    value: manufacturingOrderData.filter(
                      (item) => item.status === "InProgress"
                    ).length,
                    label: "In Progress",
                  },
                  {
                    id: 2,
                    value: manufacturingOrderData.filter(
                      (item) => item.status === "Assigned"
                    ).length,
                    label: "Assigned",
                  },
                ],
              },
            ]}
            slotProps={{
              legend: {
                hidden: false,
                direction: "column",
                labelStyle: {
                  fontSize: 12,
                  fill: "rgba(143, 143, 143, 1)",
                },
                position: {
                  vertical: "middle",
                  horizontal: "right",
                },
                itemMarkWidth: 15,
                itemMarkHeight: 6,
              },
            }}
            padding="0"
            height={140}
          />
        </div>
        <Divider orientation="vertical" style={{ height: "150px" }} />
        <div className="PMDashBoard1Inner">
          <div>
            <p>Work Orders</p>
            <ion-icon name="filter-outline"></ion-icon>
          </div>{" "}
          <PieChart
            colors={[
              "rgba(165, 180, 252, 1)",
              "rgba(99, 102, 241, 1)",
              "rgba(99, 102, 241, 1)",
            ]}
            series={[
              {
                data: [
                  {
                    id: 0,
                    value: workOrderData.filter(
                      (item) => item.status === "Completed"
                    ).length,
                    label: "Completed",
                  },
                  {
                    id: 1,
                    value: workOrderData.filter(
                      (item) => item.status === "InProgress"
                    ).length,
                    label: "In Progress",
                  },
                  {
                    id: 2,
                    value: workOrderData.filter(
                      (item) => item.status === "Pending"
                    ).length,
                    label: "Not Assigned",
                  },
                ],
              },
            ]}
            slotProps={{
              legend: {
                hidden: false,
                direction: "column",
                labelStyle: {
                  fontSize: 12,
                  fill: "rgba(143, 143, 143, 1)",
                },
                position: {
                  vertical: "middle",
                  horizontal: "right",
                },
                itemMarkWidth: 15,
                itemMarkHeight: 6,
              },
            }}
            padding="0"
            height={140}
          />
        </div>
      </div>
      <div className="PMDashBoardBody2">
        <div className="PMDashBoardBody2Inner1">
          <WorkOrderTimeLine />
        </div>
        <Divider orientation="vertical" style={{ height: "300px" }} />
        <div className="PMDashBoardBody2Inner2">
          <div>
            <p>Long Pending Orders</p>
            <ion-icon name="filter-outline"></ion-icon>
          </div>
          <table className="PMDashBoardBody1Inner2InnerP2">
            <thead>
              <tr>
                <th>Work Order</th>
                <th> Part Name</th>
              </tr>
            </thead>
            <tbody className="PMDashBoardBody1Inner2InnerP2TableBody">
              {workOrderDataWithPartRef.map((order) => (
                <tr
                  key={order.id}
                  className="PMDashBoardBody1Inner2InnerP2TableBodyInner"
                >
                  <td>{order?.number}</td>
                  <td>{order?.part?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PMDashBoard;
