import React, { useEffect, useState } from "react";
import "./Home.css";
import Chart from "react-google-charts";
import { fetchWorkOrderWithNoDependency } from "../../../services/WOrderService";

const WorkOrderTimeLine = () => {
  const [workOrderData, setWorkOrderData] = useState([]);
  const [workOrderTechnicianData, setWorkOrderTechnicianData] = useState([]);
  const [timeGranularity, setTimeGranularity] = useState("day");
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const data = await fetchWorkOrderWithNoDependency();
      setWorkOrderData(data);
      const technicianAvailableData = data.filter((item) => item.technician);
      setWorkOrderTechnicianData(
        technicianAvailableData.map((item) => item.technician)
      );
    } catch (error) {
      console.error("Error fetching work orders:", error);
    }
  };

  useEffect(() => {
    if (workOrderData.length > 0) {
      console.log("Example Work Order Data:", workOrderData[0]);
    }
  }, [workOrderData]);

  const timeLineColumns = [
    { type: "string", id: "number" },
    { type: "date", id: "Start" },
    { type: "date", id: "End" },
  ];

  const timeLineRows = workOrderData
    .filter((order) => order.dueDate && order.createdDate && order.number)
    .map((order) => [
      order.number,
      new Date(order.createdDate),
      new Date(order.dueDate),
    ]);

  const TimeLineData = [timeLineColumns, ...timeLineRows];

  const getFilteredDataByTechnician = () => {
    if (!selectedTechnician) return workOrderData;

    return workOrderData.filter(
      (order) => order.technician && order.technician.id === selectedTechnician
    );
  };

  const BarData = [
    ["Work Order", "Duration"],
    ...getFilteredDataByTechnician().map((order) => [
      order.number,
      (new Date(order.dueDate) - new Date(order.createdDate)) /
        (1000 * 60 * 60 * 24), // Duration in days
    ]),
  ];

  const getViewWindow = () => {
    const now = new Date();
    let start, end;
    switch (timeGranularity) {
      case "half-day":
        start = new Date(now.setHours(now.getHours() - 12));
        end = new Date(now.setHours(now.getHours() + 12));
        break;
      case "day":
        start = new Date(now.setDate(now.getDate() - 1));
        end = new Date(now.setDate(now.getDate() + 1));
        break;
      case "week":
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date(now.setDate(now.getDate() + 7));
        break;
      case "month":
        start = new Date(now.setMonth(now.getMonth() - 1));
        end = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case "year":
        start = new Date(now.setFullYear(now.getFullYear() - 1));
        end = new Date(now.setFullYear(now.getFullYear() + 1));
        break;
      default:
        start = new Date(now.setDate(now.getDate() - 1));
        end = new Date(now.setDate(now.getDate() + 1));
        break;
    }
    return { start, end };
  };

  const { start, end } = getViewWindow();

  const options = {
    hAxis: {
      viewWindow: {
        min: start,
        max: end,
      },
    },
  };

  return (
    <div className="WorkOrderData">
      {/* <div className="WorkOrderTimeline">
        <div className="WorkOrderTimelineHeader">
          <p>Work Orders Timeline</p>
          <div className="TimeGranularitySelector">
            <select
              id="granularity"
              value={timeGranularity}
              onChange={(e) => setTimeGranularity(e.target.value)}
            >
              <option value="half-day">Half Day</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>
        <Chart
          chartType="Timeline"
          data={TimeLineData}
          width="100%"
          height="95%"
          options={options}
        />
      </div>
      <div className="WorkOrderBarGraph">
        <div className="WorkOrderBarGraphHeader">
          <p>WorkOrders Status</p>
          <div className="TechnicianSelector">
            <select
              id="technician"
              value={selectedTechnician || ""}
              onChange={(e) => setSelectedTechnician(e.target.value)}
            >
              <option value="">All Technicians</option>
              {workOrderTechnicianData.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.firstName} {item.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Chart
          chartType="Bar"
          data={BarData}
          options={{
            hAxis: { title: "WorkOrders" },
            vAxis: { title: "Time Consuming" },
            legend: { position: "none" },
          }}
          width="100%"
          height="100%"
        />
      </div> */}
      <div className="WorkOrderBarGraphHeader">
        <p>WorkOrders Status</p>
        <div className="TechnicianSelector">
          <select
            id="technician"
            value={selectedTechnician || ""}
            onChange={(e) => setSelectedTechnician(e.target.value)}
          >
            <option value="">All Technicians</option>
            {workOrderTechnicianData.map((item) => (
              <option key={item.id} value={item.id}>
                {item.firstName} {item.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Chart
        chartType="Bar"
        data={BarData}
        options={{
          hAxis: { title: "WorkOrders" },
          vAxis: { title: "Time Consuming" },
          legend: { position: "none" },
        }}
        width="100%"
        height="100%"
      />
    </div>
  );
};

export default WorkOrderTimeLine;
