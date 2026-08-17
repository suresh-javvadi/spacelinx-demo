import { Divider, LinearProgress } from "@mui/material";
import { PieChart } from "@mui/x-charts";
import React, { useEffect, useState } from "react";
import "./MPEDashBoard.css";
import { fetchGuide } from "../../../services/guideService";
const MPEDashBoard = () => {
  const [guideData, setGuideData] = useState([]);
  useEffect(() => {
    fetchGuideInfo();
  }, []);
  const fetchGuideInfo = async () => {
    try {
      const data = await fetchGuide();
      if (data) {
        setGuideData(data);
      }
    } catch (error) {
      console.log(error);
    }
  };
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
    { id: 3, name: "TOTAL GUIDES", number: guideData.length },
  ];
  const GuideProgress = [
    { id: 1, name: "Completed", count: 20, totalCount: 100 },
    { id: 2, name: "Published", count: 20, totalCount: 100 },
    { id: 3, name: "Yet to Start", count: 20, totalCount: 100 },
  ];

  const GuideDetailsTable = [
    {
      id: 1,
      name: "Guide1",
      partName: "Part1",
    },
    {
      id: 1,
      name: "Guide1",
      partName: "Part1",
    },
    {
      id: 1,
      name: "Guide1",
      partName: "Part1",
    },
    {
      id: 1,
      name: "Guide1",
      partName: "Part1",
    },
    {
      id: 1,
      name: "Guide1",
      partName: "Part1",
    },
    {
      id: 1,
      name: "Guide1",
      partName: "Part1",
    },
    {
      id: 1,
      name: "Guide1",
      partName: "Part1",
    },
  ];
  const AssignedGuidesList = [
    {
      id: 1,
      name: "Guide1",
      number: 20,
      employee: "Sainath",
      status: "Inprogress",
    },
    {
      id: 2,
      name: "Guide2",
      number: 20,
      employee: "Jaswanth",
      status: "published",
    },
    {
      id: 3,
      name: "Guide3",
      number: 20,
      employee: "Lalith",
      status: "Inprogress",
    },
    {
      id: 3,
      name: "Guide3",
      number: 20,
      employee: "Lalith",
      status: "Inprogress",
    },
    {
      id: 3,
      name: "Guide3",
      number: 20,
      employee: "Lalith",
      status: "published",
    },
    {
      id: 3,
      name: "Guide3",
      number: 20,
      employee: "Lalith",
      status: "completed",
    },
    {
      id: 3,
      name: "Guide3",
      number: 20,
      employee: "Lalith",
      status: "published",
    },
    {
      id: 3,
      name: "Guide3",
      number: 20,
      employee: "hhhh",
      status: "Inprogress",
    },
  ];
  return (
    <div className="MPEDashBoardPageMainDiv">
      <div className="MPEDashBoardHeader">
        {guidesType.map((guide) => (
          <div className="MPEDashBoardHeaderInnerDiv" key={guide.id}>
            <p key={guide.id} className="MPEDashBoardHeaderInnerDivP1">
              {guide.name}
            </p>
            <p key={guide.id} className="MPEDashBoardHeaderInnerDivP2">
              {guide.number}
            </p>
          </div>
        ))}
      </div>
      <div className="MPEDashBoardBody">
        <div className="MPEDashBoardBody1">
          <div className="MPEDashBoardBody1Inner1">
            <p className="MPEDashBoardBody1Inner1P1">Guides Progress</p>
            {GuideProgress.map((guide) => (
              <div className="MPEDashBoardBody1InnerInner">
                <p className="MPEDashBoardBody1InnerInnerP1">{guide.name}</p>
                <LinearProgress
                  variant="determinate"
                  className="GuideProgressBar"
                  value={30}
                />
                <p className="MPEDashBoardBody1InnerInnerP2">
                  {guide.count}/{guide.totalCount}
                </p>
              </div>
            ))}
          </div>
          <div className="MPEDashBoardBody1Inner2">
            <p className="MPEDashBoardBody1Inner2P1">Guide Status</p>
            <div className="MPEDashBoardBody1Inner2Inner">
              <div className="MPEDashBoardBody1Inner2Inner1">
                <PieChart
                  colors={["rgba(99, 102, 241, 1)", "rgba(139, 92, 246, 1)"]}
                  series={[
                    {
                      data: [
                        {
                          id: 0,
                          value: 3,
                          label: "In Use",
                        },
                        {
                          id: 1,
                          value: 2,
                          label: "To be Updated",
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
              <div className="MPEDashBoardBody1Inner2Inner2">
                <div className=" MPEDashBoardBody1Inner2Inner2RadioDiv">
                  <div>
                    <input type="radio"></input>
                    <p>In Use</p>
                  </div>
                  <div>
                    <input type="radio"></input>
                    <p>To be Updated</p>
                  </div>
                </div>
                <table className="MPEDashBoardBody1Inner2InnerP2">
                  <thead>
                    <tr>
                      <th>Guide</th> <th> Part Name</th>
                    </tr>
                  </thead>
                  <tbody className="MPEDashBoardBody1Inner2InnerP2TableBody">
                    {GuideDetailsTable.map((guide) => (
                      <div className="MPEDashBoardBody1Inner2InnerP2TableBodyInner">
                        <td>{guide.name}</td>
                        <td>{guide.partName}</td>
                      </div>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <Divider orientation="vertical" />
        <div className="MPEDashBoardBody2">
          <p className="MPEDashBoardBody2P1">Assigned Guides</p>
          <div className="MPEDashBoardBody2Inner">
            {AssignedGuidesList.map((guide) => (
              <div
                className="MPEDashBoardBody2Inner1"
                style={{
                  backgroundColor:
                    guide.status === "published"
                      ? "rgba(232, 232, 232, 1)"
                      : guide.status === "Inprogress"
                      ? " rgba(107, 223, 156, 1)"
                      : "rgba(99, 102, 241, 1)",
                }}
              >
                <p>{guide.name}</p>
                <p>{guide.employee}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MPEDashBoard;
