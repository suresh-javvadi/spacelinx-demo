import { useContext } from "react";
import { DrawerContext } from "./DrawerContext";

export const useDrawer = () => useContext(DrawerContext);
