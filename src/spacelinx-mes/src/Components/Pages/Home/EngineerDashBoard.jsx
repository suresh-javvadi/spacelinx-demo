import { Divider, LinearProgress, TextField } from "@mui/material";
import { PieChart } from "@mui/x-charts";
import React, { useEffect, useState } from "react";
import "./EngineerDashBoard.css";
import { DataGrid } from "@mui/x-data-grid";
import Calendar from "react-calendar";
import { Link } from "react-router-dom/dist";
import {
  fetchWorkOrder,
  fetchWorkOrderWithNoDependency,
} from "../../../services/WOrderService";

const EngineerDashBoard = () => {
  const [workOrderData, setWorkOrderData] = useState([]);
  const [assignedWorkOrderData, setAssignedWorkOrderData] = useState([]);
  const [dueWorkOrderData, setDueWorkOrderData] = useState([]);
  const [assignedSearchQuery, setAssignedSearchQuery] = useState("");
  const [dueSearchQuery, setDueSearchQuery] = useState("");
  const [inProgressWOCount, setInProgressWOCount] = useState();
  const [completedWOCount, setCompletedWOCount] = useState();
  const guidesType = [
    { id: 1, name: "TOTAL WORK ORDERS", number: workOrderData.length },
    { id: 2, name: "IMMEDIATE DUE", number: 0 },
  ];
  const AssignedWorkOrdersColumns = [
    {
      field: "number",
      headerName: "Work Order",
      headerClassName: "DataGridColumn",
      flex: 1,
      renderCell: (params) => (
        <Link
          to={`/WorkOrder/${params.row.number}`}
          className="DataGridLinkCell"
        >
          {params.value ? params.value : "No Results"}
        </Link>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      headerClassName: "DataGridColumn",
      flex: 1,
    },
    {
      field: "assignedKit",
      headerName: "Assigned Kit No.",
      headerClassName: "DataGridColumn",
      flex: 1,
      renderCell: (params) => <p>{params.row.childKit?.number}</p>,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      headerClassName: "DataGridColumn",
      flex: 1,
      valueGetter: (params) => {
        const originalDate = params.row?.dueDate;
        if (originalDate) {
          const formattedDate = new Date(originalDate).toLocaleDateString();
          return formattedDate;
        }
        return null;
      },
    },
  ];
  const ImmediateDueOrdersColumns = [
    {
      field: "number",
      headerName: "Work Order",
      headerClassName: "DataGridColumn",
      flex: 1,
      renderCell: (params) => (
        <Link
          to={`/WorkOrder/${params.row.number}`}
          className="DataGridLinkCell"
        >
          {params.value ? params.value : "No Results"}
        </Link>
      ),
    },
    {
      field: "status",
      headerName: " Status",
      headerClassName: "DataGridColumn",
      flex: 1,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      headerClassName: "DataGridColumn",
      flex: 1,
      valueGetter: (params) => {
        const originalDate = params.row?.dueDate;
        if (originalDate) {
          const formattedDate = new Date(originalDate).toLocaleDateString();
          return formattedDate;
        }
        return null;
      },
    },
  ];

  useEffect(() => {
    const fetchWorkOrderData = async () => {
      try {
        const data = await fetchWorkOrderWithNoDependency();
        if (data) {
          setWorkOrderData(data);
          const inProgressWO = data.filter(
            (item) => item.status === "inProgress"
          );
          const completedWO = data.filter(
            (item) => item.status === "Completed"
          );
          const filteredAssignedData = data.filter(
            (item) => item.technician !== null
          );
          const now = new Date();
          const filteredDueDateData = filteredAssignedData.filter((item) => {
            const dueDate = new Date(item.dueDate);
            const diffTime = Math.abs(dueDate - now);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
          });
          setAssignedWorkOrderData(filteredAssignedData);
          setDueWorkOrderData(filteredDueDateData);
          setInProgressWOCount(inProgressWO.length);
          setCompletedWOCount(completedWO.length);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchWorkOrderData();
  }, []);

  const formatShortWeekday = (locale, date) => {
    return date
      .toLocaleDateString(locale, { weekday: "short" })
      .toUpperCase()
      .slice(0, 1);
  };
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  const tileClassName = ({ date }) => {
    return isToday(date) ? "highlight-today" : null;
  };
  const filteredAssignedWorkOrders = assignedWorkOrderData.filter((order) =>
    order.number.toLowerCase().includes(assignedSearchQuery.toLowerCase())
  );

  const filteredDueWorkOrders = dueWorkOrderData?.filter((order) =>
    order.number.toLowerCase().includes(dueSearchQuery.toLowerCase())
  );
  return (
    <div className="EDashBoardPageMainDiv">
      <div className="EDashBoardHeader">
        {guidesType.map((guide) => (
          <div className="EDashBoardHeaderInnerDiv" key={guide.id}>
            <p key={guide.id} className="EDashBoardHeaderInnerDivP1">
              {guide.name}
            </p>
            <p key={guide.id} className="EDashBoardHeaderInnerDivP2">
              {guide.number}
            </p>
          </div>
        ))}
      </div>
      <div className="EDashBoardBody">
        <div className="EDashBoardBody1">
          <div className="EDashBoardBody1Inner">
            <div className="EDashBoardBody1InnerHeader">
              <p>Assigned Work Orders</p>
              <div>
                <input
                  type="search"
                  placeholder="Search.."
                  value={assignedSearchQuery}
                  onChange={(e) => setAssignedSearchQuery(e.target.value)}
                ></input>
                <ion-icon name="filter-outline"></ion-icon>
              </div>
            </div>
            <div className="AssignedWODataGrid">
              <DataGrid
                className="DashBoardDataGrid"
                columns={AssignedWorkOrdersColumns}
                rows={filteredAssignedWorkOrders}
              />
            </div>
          </div>
          <div className="EDashBoardBody1Inner">
            <div className="EDashBoardBody1InnerHeader">
              <p>Immediate Due Orders</p>
              <div>
                <input
                  type="search"
                  placeholder="Search.."
                  value={dueSearchQuery}
                  onChange={(e) => setDueSearchQuery(e.target.value)}
                ></input>
                <ion-icon name="filter-outline"></ion-icon>
              </div>
            </div>
            <div className="AssignedWODataGrid">
              <DataGrid
                columns={ImmediateDueOrdersColumns}
                rows={filteredDueWorkOrders}
              />
            </div>
          </div>
        </div>
        <Divider orientation="vertical" />
        <div className="EDashBoardBody2">
          <p className="EDashBoardBody2Header">Work Order Status</p>
          <PieChart
            colors={["rgba(128, 205, 221, 1)", "rgba(96, 173, 212, 1)"]}
            series={[
              {
                data: [
                  {
                    id: 0,
                    value: inProgressWOCount + 1,
                    label: "In Progress",
                  },
                  {
                    id: 1,
                    value: completedWOCount,
                    label: "Completed",
                  },
                ],
              },
            ]}
            slotProps={{
              legend: {
                hidden: false,
                direction: "row",
                labelStyle: {
                  fontSize: 10,
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
            sx={{ marginLeft: "35%" }}
            height={210}
          />
          <p className="ScheduleHeader">Today's Schedule</p>
          <Calendar
            formatShortWeekday={formatShortWeekday}
            showNavigation={false}
            tileClassName={tileClassName}
          />
          <p className="ScheduleMeetingsHeader">Scheduled Meetings</p>
          <div className="ScheduleMeetingsBody">
            <div className="ScheduleMeetingsBodyInner">
              <p>Daily Progress Meet</p>
              <div>
                <ion-icon name="time-outline"></ion-icon>
                <p>6:00PM - 6:30PM</p>
              </div>
            </div>
            <button>Join</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashBoard;
