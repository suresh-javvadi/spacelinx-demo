import { Divider } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { PieChart } from "@mui/x-charts";
import React, { useEffect, useState } from "react";
import "./Home.css";
import { fetchGuide } from "../../../services/guideService";
import Products from "../../../features/products/product";
import { useNavigate } from "react-router-dom";
import WorkOrderTimeLine from "./WorkOrderTimeLine";
const Home = () => {
  const [guideData, setGuideData] = useState(null);
  const guidesType = [
    {
      id: 1,
      name: "PUBLISHED GUIDES",
      number: guideData?.filter((guide) => guide.status === "Published")
        ?.length,
    },
    {
      id: 2,
      name: "UNPUBLISHED GUIDES",
      number: guideData?.filter((guide) => guide.status === "Draft")?.length,
    },
    { id: 3, name: "TOTAL GUIDES", number: guideData?.length },
  ];
  const GuideProgress = [
    {
      id: 1,
      name: "Completed",
      count: 1,
      totalCount: guideData?.length,
    },
    {
      id: 2,
      name: "Published",
      count: guideData?.filter((guide) => guide.status === "Published")?.length,
      totalCount: guideData?.length,
    },
    {
      id: 3,
      name: "Yet to Start",
      count: 1,
      totalCount: guideData?.length,
    },
  ];

  useEffect(() => {
    fetchGuideData();
  }, []);
  const fetchGuideData = async () => {
    try {
      const data = await fetchGuide();
      setGuideData(data);
    } catch (error) {
      console.log(error);
    }
  };
  const nagivate = useNavigate();
  return (
    <div className="DashBoardPageMainDiv">
      <p className="PageHeader">DashBoard</p>
      <div className="DashBoardProducts">
        <Products />
      </div>
      <WorkOrderTimeLine />
      <div className="DashBoardHeader">
        {guidesType?.map((guide) => (
          <div
            className="DashBoardHeaderInnerDiv"
            key={guide.id}
            onClick={() => nagivate("/guides")}
          >
            <p key={guide.id} className="DashBoardHeaderInnerDivP1">
              {guide.name}
            </p>
            <p key={guide.id} className="DashBoardHeaderInnerDivP2">
              {guide.number}
            </p>
          </div>
        ))}
      </div>
      <div className="DashBoardBody">
        <div className="DashBoardBody1">
          <div className="DashBoardBody1Inner1">
            <p className="DashBoardBody1Inner1P1">Guides Progress</p>
            {GuideProgress.map((guide) => (
              <div className="DashBoardBody1InnerInner">
                <p className="DashBoardBody1InnerInnerP1">{guide.name}</p>
                <LinearProgress
                  className="GuideProgressBar"
                  variant="determinate"
                  value={(guide.count / guide.totalCount) * 100}
                />
                <p className="DashBoardBody1InnerInnerP2">
                  {guide.count}/{guide.totalCount}
                </p>
              </div>
            ))}
          </div>
          <div className="DashBoardBody1Inner2">
            <p className="DashBoardBody1Inner2P1">Guide Status</p>
            <div className="DashBoardBody1Inner2Inner">
              <div className="DashBoardBody1Inner2Inner1">
                <PieChart
                  colors={["rgba(99, 102, 241, 1)", "rgba(139, 92, 246, 1)"]}
                  series={[
                    {
                      data: [
                        {
                          id: 0,
                          value: guideData?.filter(
                            (item) => item.status === "Published"
                          ).length,
                          label: "Published",
                        },
                        {
                          id: 1,
                          value: guideData?.filter(
                            (item) => item.status === "Draft"
                          ).length,
                          label: "Not Published",
                        },
                      ],
                    },
                  ]}
                  slotProps={{
                    legend: {
                      hidden: false,
                      direction: "row",
                      labelStyle: {
                        fontSize: 12,
                        fill: "rgba(143, 143, 143, 1)",
                      },
                      position: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      padding: 0,
                      itemMarkWidth: 15,
                      itemMarkHeight: 6,
                    },
                  }}
                  sx={{ marginLeft: "50px" }}
                  height={210}
                  width={280}
                />
              </div>
              <div className="DashBoardBody1Inner2Inner2">
                <div className=" DashBoardBody1Inner2Inner2RadioDiv">
                  <div>
                    <input type="radio"></input>
                    <p>In Use</p>
                  </div>
                  <div>
                    <input type="radio"></input>
                    <p>To be Updated</p>
                  </div>
                </div>
                <table className="DashBoardBody1Inner2InnerP2">
                  <thead>
                    <tr>
                      <th>Guide</th> <th> Part Name</th>
                    </tr>
                  </thead>
                  <tbody className="DashBoardBody1Inner2InnerP2TableBody">
                    {guideData?.map((guide) => (
                      <div className="DashBoardBody1Inner2InnerP2TableBodyInner">
                        <td>{guide.name}</td>
                        <td>{guide.part.name}</td>
                      </div>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <Divider orientation="vertical" />
        <div className="DashBoardBody2">
          <p className="DashBoardBody2P1">Assigned Guides</p>
          <div className="DashBoardBody2Inner">
            {guideData?.map((guide) => (
              <div
                className="DashBoardBody2Inner1"
                style={{
                  backgroundColor:
                    guide.status === "published"
                      ? "rgba(232, 232, 232, 1)"
                      : guide.status === "Draft"
                      ? " rgba(107, 223, 156, 1)"
                      : "rgba(99, 102, 241, 1)",
                }}
              >
                <p>{guide.name}</p>
                <p>{guide.number}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
