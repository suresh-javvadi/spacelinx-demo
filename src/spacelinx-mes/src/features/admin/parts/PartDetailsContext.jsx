import { createContext, useContext, useState } from "react";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import EditPart from "./EditPart";
import Cliploader from "../../../Components/Loaders/Cliploader";

const PartDetailsDrawerContext = createContext();

export const usePartDetailsDrawer = () => {
  const context = useContext(PartDetailsDrawerContext);

  if (!context) {
    console.warn(
      "usePartDetailsDrawer called outside PartDetailsDrawerProvider"
    );
    return {
      openDrawers: [],
      openPartDetailsDrawer: () => {},
      closePartDetailsDrawer: () => {},
    };
  }

  return context;
};

export const PartDetailsDrawerProvider = ({ children }) => {
  const [openDrawers, setOpenDrawers] = useState([]);
  const [loading, setLoading] = useState(false);

  const openPartDetailsDrawer = (details) => {
    setLoading(true);
    setOpenDrawers((prev) => [...prev, details]);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const closePartDetailsDrawer = (indexToClose) => {
    setOpenDrawers((prev) => prev.filter((_, index) => index !== indexToClose));
  };

  return (
    <PartDetailsDrawerContext.Provider
      value={{
        openPartDetailsDrawer,
        closePartDetailsDrawer,
        openDrawers,
      }}
    >
      {children}

      {openDrawers.map((partDetails, index) => (
        <ResizableDrawer
          key={index}
          anchor="right"
          open={true}
          onClose={() => closePartDetailsDrawer(index)}
          defaultWidth={75 - (index + 1) * 1}
        >
          {loading ? (
            <div>
              <Cliploader />
            </div>
          ) : (
            <EditPart
              selectedPartNumberSuffix={partDetails?.partNumberSuffix}
              selectedPartNumber={partDetails?.partNumber}
              handleRefresh={() => {}}
              handleCloseClick={() => {}}
              handleClose={() => closePartDetailsDrawer(index)}
            />
          )}
        </ResizableDrawer>
      ))}
    </PartDetailsDrawerContext.Provider>
  );
};
