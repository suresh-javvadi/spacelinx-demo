import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchIssues } from "../../services/issuesService";

const IssuesContext = createContext();

export const useIssues = () => {
  const context = useContext(IssuesContext);

  if (!context) {
    console.warn("useIssues called outside IssuesProvider");
    return {
      issuesData: [],
      loadingData: false,
      fetchIssuesData: () => {},
    };
  }

  return context;
};

export const IssuesProvider = ({ children }) => {
  const [issuesData, setIssuesData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const fetchIssuesData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchIssues();
      if (data) {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setIssuesData(data);
      }
    } catch (error) {
      console.error("Error fetching issues data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchIssuesData();
  }, []);

  return (
    <IssuesContext.Provider
      value={{
        issuesData,
        loadingData,
        fetchIssuesData,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
};
