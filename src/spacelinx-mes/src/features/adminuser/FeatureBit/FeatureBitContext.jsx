import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchFeatureBit } from "../../../services/featureBitService";
import Cliploader from "../../../Components/Loaders/Cliploader";

const FeatureBitContext = createContext();

export const useFeatureBitContext = () => {
  const context = useContext(FeatureBitContext);
  if (!context) {
    console.warn("⚠️ useFeatureBitContext() called outside provider");
    return {
      featureBitData: [],
      loadingData: false,
      fetchFeatureBitContextData: () => {},
    };
  }
  return context;
};

export const FeatureBitContextProvider = ({ children }) => {
  const [featureBitData, setFeatureBitData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchFeatureBitContextData();
  }, []);

  const fetchFeatureBitContextData = async () => {
    try {
      const data = await fetchFeatureBit();
      setFeatureBitData(data);
    } catch (error) {
      console.error("Error fetching feature bit data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <FeatureBitContext.Provider
      value={{ fetchFeatureBitContextData, featureBitData, loadingData }}
    >
      {loadingData ? <Cliploader /> : children}
    </FeatureBitContext.Provider>
  );
};
