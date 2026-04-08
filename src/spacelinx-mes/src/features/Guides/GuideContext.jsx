import React, { createContext, useState } from "react";
export const GuideContext = createContext();
export const GuideContextProvider = ({ children }) => {
  const [triggerRecall, setTriggerReCall] = useState(false);
  const [triggerGenealogyData, setTriggerGenealogyData] = useState(false);
  const [taskListData, setTaskListData] = useState(false);
  return (
    <GuideContext.Provider
      value={{
        setTriggerReCall,
        triggerRecall,
        setTriggerGenealogyData,
        triggerGenealogyData,
        setTaskListData,
        taskListData,
      }}
    >
      {children}
    </GuideContext.Provider>
  );
};
