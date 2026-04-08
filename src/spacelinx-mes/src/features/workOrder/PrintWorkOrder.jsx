import React, { forwardRef } from "react";
import { Divider } from "@mui/material";
import VideoFilePng from "../../Assest/Images/videoFileLogo.png";
import NoImagePlaceholder from "../../Assest/Images/NoImage.jpg";
import XDwatermark from "../../Assest/Images/XDwatermark.png";
import {
  FaHammer,
  FaFileAlt,
  FaClipboardCheck,
  FaCamera,
  FaBriefcase,
} from "react-icons/fa";
import {
  IoConstructOutline,
  IoBuildOutline,
  IoCogOutline,
} from "react-icons/io5";
import { MdStarOutline } from "react-icons/md";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const PrintWorkOrder = forwardRef(({ workOrderData }, ref) => {
  const currentYear = new Date().getFullYear();

  const PageHeader = ({ workOrderData }) => (
    <div className="printPageHeader">
      <div>
        <span className="printHeaderlabel">Work Order:</span>
        <span className="printHeaderValue">
          {workOrderData?.name}/{workOrderData?.number}
        </span>
      </div>
      <div>
        <span className="printHeaderlabel">Part:</span>
        <span className="printHeaderValue">
          {workOrderData?.part?.name}/{workOrderData?.part?.partNumber}
        </span>
      </div>
      <div>
        <span className="printHeaderlabel">Status:</span>
        <span className="printHeaderValue">{workOrderData?.status}</span>
      </div>
    </div>
  );

  const PageFooter = ({ currentPage, totalPages }) => (
    <div className="printPageFooter">
      <div>
        Copyright &copy;{currentYear} XDLINX Space Labs Pvt Ltd Confidential and
        Proprietary
      </div>
    </div>
  );

  const CoverPage = ({ workOrderData }) => (
    <div className="printPage printCoverPage">
      <div className="coverPageContent">
        <div className="coverPageTitle">
          <h1>{workOrderData?.name}</h1>
          <h2>Work Order Number: {workOrderData?.number}</h2>
        </div>
        <div className="coverPageDetails">
          <p>
            Part: {workOrderData?.part?.name} /{" "}
            {workOrderData?.part?.partNumber}
          </p>
          {workOrderData?.product && (
            <p>Product: {workOrderData?.product?.name}</p>
          )}
          <p>Status: {workOrderData?.status}</p>
          <p>Total Steps: {workOrderData?.workOrderSteps?.length || 0}</p>
        </div>
        <div className="coverPageFooter">
          <p>Copyright &copy;{currentYear} XDLINX Space Labs Pvt Ltd</p>
          <p>Confidential and Proprietary</p>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="printContainer">
      <img src={XDwatermark} alt="Watermark" className="printWatermark" />
      <CoverPage workOrderData={workOrderData} />
      {workOrderData?.workOrderSteps
        ?.sort((a, b) => a.guideStep.sequence - b.guideStep.sequence)
        .map((workOrderStep, stepIndex) => {
          const totalPages = workOrderData.workOrderSteps.length;
          const isLastStep = stepIndex === totalPages - 1;

          return (
            <div
              key={stepIndex}
              className="printPage"
              style={{ pageBreakAfter: isLastStep ? "auto" : "always" }}
            >
              <PageHeader workOrderData={workOrderData} />

              <div className="printStepContainer">
                <div className="printStep">
                  <div className="printImageSection">
                    <div className="printStepTitle">
                      <h2>
                        {workOrderStep.guideStep.sequence}.{" "}
                        {workOrderStep.guideStep.title}
                      </h2>
                    </div>
                    <div className="printStepImageContainer">
                      {workOrderStep.image?.filePath ? (
                        <img
                          src={workOrderStep.image.filePath}
                          alt={`Step ${workOrderStep.sequence}`}
                          className="printStepImage"
                        />
                      ) : workOrderStep?.videoId ? (
                        <img
                          src={VideoFilePng}
                          alt={`Video for Step ${workOrderStep.sequence}`}
                          className="printStepImage"
                        />
                      ) : (
                        <img
                          src={NoImagePlaceholder}
                          alt="No image available"
                          className="printStepImage"
                        />
                      )}
                    </div>
                  </div>
                  <div className="printTasksSection">
                    <div className="printTaskContainer">
                      {workOrderData.workOrderTasks.filter(
                        (task) => task.workOrderStepId === workOrderStep.id
                      ).length > 0 ? (
                        workOrderData.workOrderTasks
                          .filter(
                            (task) => task?.workOrderStepId === workOrderStep.id
                          )
                          .sort(
                            (a, b) =>
                              a.guideStepTask.sequence -
                              b.guideStepTask.sequence
                          )
                          .map((task, taskIndex) => (
                            <div>
                              <div
                                key={taskIndex}
                                className="printStepTask borderedTask"
                              >
                                <div className="taskContent">
                                  {task.guideStepTask.type && (
                                    <p className="printTaskType">
                                      {(() => {
                                        if (
                                          task.guideStepTask.type === "Data"
                                        ) {
                                          return <FaFileAlt />;
                                        } else if (
                                          task.guideStepTask.type === "Assembly"
                                        ) {
                                          return <FaHammer />;
                                        } else if (
                                          task.guideStepTask.type === "Test"
                                        ) {
                                          return <FaClipboardCheck />;
                                        } else if (
                                          task.guideStepTask.type === "Picture"
                                        ) {
                                          return <FaCamera />;
                                        } else if (
                                          task.guideStepTask.type ===
                                          "Genealogy"
                                        ) {
                                          return <FaBriefcase />;
                                        }
                                        return null;
                                      })()}
                                    </p>
                                  )}
                                  <Divider orientation="vertical" flexItem />
                                  <p className="printTaskDescription">
                                    {task.guideStepTask.name}
                                  </p>
                                </div>
                                {task.guideStepTask.ismandatory === 1 && (
                                  <p className="printTaskBehaviour">
                                    <MdStarOutline />
                                  </p>
                                )}
                                {task.status === "Completed" && (
                                  <p className="printTaskStatusCompleted">
                                    <IoCheckmarkCircleOutline />
                                  </p>
                                )}
                              </div>
                              <div>
                                {task.guideStepTask.type === "Picture" &&
                                  task.taskResponse &&
                                  (() => {
                                    const parsedResponse = JSON.parse(
                                      task.taskResponse
                                    );

                                    return parsedResponse.picture?.response
                                      ?.filePath ? (
                                      <img
                                        src={
                                          parsedResponse.picture.response
                                            .filePath
                                        }
                                        alt="Task response"
                                        className="printStepImage"
                                      />
                                    ) : null;
                                  })()}
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="printNotAvailableMsg">
                          No Tasks Available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <PageFooter currentPage={stepIndex + 1} totalPages={totalPages} />
            </div>
          );
        })}
    </div>
  );
});

export default PrintWorkOrder;
