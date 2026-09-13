import { useContext } from "react";
import { LocationContext } from "../context/locationPreferenceContext";

export function useLocationPreference() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationPreference must be used within LocationProvider");
  }
  return context;
}
