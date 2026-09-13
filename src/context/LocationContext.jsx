import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  checkAreaAvailability,
  findNearestArea,
  getAreas,
  getCities,
  getPincodes,
  getStates,
} from "../services/api";
import { LocationContext } from "./locationPreferenceContext";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "localpintu-location";
// Increment this whenever persisted location semantics change. Version 8 drops
// the old generic Mansarovar fallback that could otherwise survive refreshes.
const STORAGE_VERSION = 9;
const MAX_ACCEPTABLE_ACCURACY_METERS = 1500;
const GPS_CACHE_MAX_AGE_MS = 30 * 60 * 1000;
const locationDebug = () => {};

const currentLocationOwner = () => {
  try {
    const customer = JSON.parse(localStorage.getItem("localpintu-auth") || "{}")?.customer;
    return String(customer?._id || customer?.email || customer?.mobileNumber || "").trim();
  } catch {
    return "";
  }
};

const readStoredLocation = () => {
  try {
    const value = JSON.parse(
      typeof localStorage !== "undefined"
        ? localStorage.getItem(STORAGE_KEY) || "null"
        : "null",
    );

    const owner = currentLocationOwner();
    const ownerMatches = String(value?.ownerKey || "") === owner;
    return value?.version === STORAGE_VERSION
      && ownerMatches
      && "serviceAvailable" in (value || {})
      ? value
      : null;
  } catch {
    return null;
  }
};

const isReusableStoredLocation = (value) => {
  if (!value) return false;
  if (["manual", "profile"].includes(value.addressSource)) return true;
  const detectedAt = Date.parse(value.detectedAt || "");
  return value.addressSource === "gps"
    && Number.isFinite(detectedAt)
    && Date.now() - detectedAt <= GPS_CACHE_MAX_AGE_MS;
};

const isGenericAddress = (value) => {
  const address = String(value || "").trim();
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length <= 2 || /^jaipur municipal corporation(?:,|$)/i.test(address);
};

const readProfileAddress = () => {
  try {
    const customer = JSON.parse(localStorage.getItem("localpintu-auth") || "{}")?.customer;
    const address = String(customer?.address || "").trim();
    return address && !isGenericAddress(address)
      ? { address, pincode: String(customer?.pincode || "").trim() }
      : null;
  } catch {
    return null;
  }
};

const hierarchyExactAddress = (location) => [
  location?.area?.name,
  location?.city?.name,
  location?.state?.name,
  location?.pincode?.code,
].map((part) => String(part || "").trim()).filter(Boolean).join(", ");

const geoMessage = (error) => {
  if (error?.code === 1) {
    return "Location permission is blocked. Allow location in browser settings, then try again.";
  }
  if (error?.code === 2) {
    return "Your current location is unavailable. Check device location services, then try again.";
  }
  if (error?.code === 3) {
    return "Location detection timed out. Please try again.";
  }
  return "Unable to detect your location. Please try again.";
};

const getGeolocationPermission = async () => {
  try {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      return "prompt";
    }
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state;
  } catch {
    // Permissions API is not supported consistently by every browser. In that
    // case getCurrentPosition remains the authoritative permission request.
    return "prompt";
  }
};

export function LocationProvider({ children }) {
  const { customer } = useAuth();
  const accountKey = String(customer?._id || customer?.email || customer?.mobileNumber || "").trim();
  const requestId = useRef(0);
  const requestInFlight = useRef(false);
  const catalogRequest = useRef(null);
  const autoDetectAttempted = useRef(false);
  const mounted = useRef(true);
  const previousAccountKey = useRef(accountKey);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [location, setLocation] = useState(readStoredLocation);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(() =>
    readStoredLocation()
      ? ""
      : "Choose your area or use Detect location to check service availability.",
  );

  const showLocationError = useCallback((message) => {
    if (mounted.current) {
      setLocationError(message || "Location unavailable");
    }
  }, []);

  const detectLocation = useCallback(async (userInitiated = false) => {
    if (requestInFlight.current) {
      return;
    }

    const id = ++requestId.current;
    requestInFlight.current = true;
    locationDebug("Detection started", { id, userInitiated });
    setLoadingLocation(true);
    setLocationError("");
    if (userInitiated) {
      localStorage.removeItem(STORAGE_KEY);
      setLocation(null);
    }

    const finish = () => {
      if (id === requestId.current) {
        requestInFlight.current = false;
        if (mounted.current) setLoadingLocation(false);
      }
    };

    const geolocationAvailable =
      typeof navigator !== "undefined" && Boolean(navigator.geolocation);

    if (!geolocationAvailable) {
      showLocationError("Location services are not supported by this browser.");
      finish();
      return;
    }

    const permission = await getGeolocationPermission();
    locationDebug("Permission state:", permission);
    if (!mounted.current || id !== requestId.current) {
      finish();
      return;
    }

    if (permission === "denied" && !userInitiated) {
      showLocationError(
        "Location permission is blocked. Allow location in browser settings, then try again.",
      );
      finish();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        if (!mounted.current || id !== requestId.current) {
          finish();
          return;
        }

        try {
          const accuracy = Number(coords.accuracy);
          const payload = {
            latitude: Number(coords.latitude),
            longitude: Number(coords.longitude),
          };
          locationDebug("GPS success");
          locationDebug("GPS latitude:", payload.latitude);
          locationDebug("GPS longitude:", payload.longitude);
          locationDebug("Accuracy:", accuracy, "meters");

          if (
            !Number.isFinite(payload.latitude)
            || !Number.isFinite(payload.longitude)
          ) {
            showLocationError("The browser returned invalid location coordinates. Please try again.");
            return;
          }

          if (Number.isFinite(accuracy) && accuracy > MAX_ACCEPTABLE_ACCURACY_METERS) {
            showLocationError(
              `Location accuracy is too low (about ${Math.round(accuracy)} metres). Move near a window or enable precise device location, then try again.`,
            );
            return;
          }

          locationDebug("Reverse geocoding started", payload);
          const result = await findNearestArea(payload);

          if (!mounted.current || id !== requestId.current) return;
          locationDebug("Reverse geocoding response:", result);
          locationDebug("Parsed area:", result?.area?.exactAddress || result?.area?.name || "");
          locationDebug("Parsed city:", result?.city?.name || "");
          locationDebug("Parsed state:", result?.state?.name || "");
          locationDebug("Parsed pincode:", result?.pincode?.code || result?.detectedPincode || "");

          const message =
            result?.message
            || result?.reason
            || "Service is unavailable for the detected pincode.";

          if (!(result?.available ?? result?.serviceAvailable)) {
            localStorage.removeItem(STORAGE_KEY);
            setLocation(null);
            showLocationError(message);
            return;
          }

          if (
            !result?.success
            || !result.state?._id
            || !result.city?._id
            || !result.area?._id
            || !result.pincode?._id
          ) {
            showLocationError(
              result?.detectedPincode
                ? `Pincode ${result.detectedPincode} is not active for service.`
                : message,
            );
            return;
          }

          const selected = {
            version: STORAGE_VERSION,
            ownerKey: currentLocationOwner(),
            serviceAvailable: Boolean(result.available ?? result.serviceAvailable),
            detectedAt: new Date().toISOString(),
            coordinates: payload,
            accuracy: Number.isFinite(accuracy) ? accuracy : null,
            state: result.state,
            city: result.city,
            area: result.area,
            pincode: result.pincode,
            distance: result.distance,
            radius: result.radius,
            message,
            addressSource: "gps",
          };

          const saved = readStoredLocation();
          const profileLocation = readProfileAddress();
          const detectedAddress = String(selected.area?.exactAddress || "").trim();
          const genericDetectedAddress = isGenericAddress(detectedAddress);
          const sameSavedLocation = saved?.area?._id === selected.area?._id
            && saved?.pincode?._id === selected.pincode?._id;
          if (
            genericDetectedAddress
            && sameSavedLocation
            && saved?.addressSource === "manual"
            && saved?.area?.exactAddress
          ) {
            selected.area = {
              ...selected.area,
              exactAddress: saved.area.exactAddress,
            };
            selected.addressSource = "manual";
          } else if (
            genericDetectedAddress
            && profileLocation?.address
            && (!profileLocation.pincode || profileLocation.pincode === String(selected.pincode?.code || ""))
          ) {
            selected.area = {
              ...selected.area,
              exactAddress: profileLocation.address,
            };
            selected.addressSource = "profile";
          } else if (genericDetectedAddress) {
            selected.area = {
              ...selected.area,
              exactAddress: hierarchyExactAddress(selected),
            };
            selected.addressSource = "area";
          }

          localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
          locationDebug("Backend location matched:", Boolean(result.available ?? result.serviceAvailable));
          locationDebug("Final location:", selected);
          setLocation(selected);
          setLocationError(selected.serviceAvailable ? "" : message);
        } catch (error) {
          if (mounted.current && id === requestId.current) {
            showLocationError(error.message);
          }
        } finally {
          finish();
        }
      },
      (error) => {
        if (error?.code === 1) {
          locationDebug("Permission denied");
        } else if (error?.code === 2) {
          locationDebug("Position unavailable");
        } else if (error?.code === 3) {
          locationDebug("Timeout");
        } else {
          locationDebug("Location unavailable");
        }

        if (mounted.current && id === requestId.current) {
          showLocationError(geoMessage(error));
        }
        finish();
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }, [showLocationError]);

  const ensureCatalog = useCallback(() => {
    if (catalogRequest.current) return catalogRequest.current;

    catalogRequest.current = Promise.all([
      getStates(),
      getCities(),
      getAreas(),
      getPincodes(),
    ])
      .then(([nextStates, nextCities, nextAreas, nextPincodes]) => {
        setStates(nextStates);
        setCities(nextCities);
        setAreas(nextAreas);
        setPincodes(nextPincodes);
        return {
          states: nextStates,
          cities: nextCities,
          areas: nextAreas,
          pincodes: nextPincodes,
        };
      })
      .catch((error) => {
        catalogRequest.current = null;
        throw error;
      });

    return catalogRequest.current;
  }, []);

  useEffect(() => {
    mounted.current = true;
    locationDebug("LocationContext Mounted");
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (location) {
      locationDebug("UI Updated", {
        area: location.area?.name,
        pincode: location.pincode?.code,
        serviceAvailable: location.serviceAvailable,
      });
    }
  }, [location]);

  useEffect(() => {
    if (autoDetectAttempted.current) return;

    const stored = readStoredLocation();
    if (isReusableStoredLocation(stored)) {
      autoDetectAttempted.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      if (autoDetectAttempted.current) return;
      autoDetectAttempted.current = true;
      detectLocation(false);
    }, 600);

    return () => window.clearTimeout(timer);
  }, [detectLocation]);

  useEffect(() => {
    if (previousAccountKey.current === accountKey) return;
    previousAccountKey.current = accountKey;
    localStorage.removeItem(STORAGE_KEY);
    setLocation(null);
    setLocationError("Choose your area or use Detect location to check service availability.");
    autoDetectAttempted.current = true;
    detectLocation(false);
  }, [accountKey, detectLocation]);

  const selectManualLocation = useCallback(
    async ({ stateId, cityId, areaId, pincodeId }) => {
      setLoadingLocation(true);
      setLocationError("");
      try {
        const pin = pincodes.find((item) => item._id === pincodeId);
        const resolvedAreaId = areaId || (typeof pin?.areaId === "object" ? pin.areaId?._id : pin?.areaId);
        const result = await checkAreaAvailability({
          stateId,
          cityId,
          areaId: resolvedAreaId,
          pincodeId,
          pincode: pin?.code,
        });
        const state = states.find((item) => item._id === stateId);
        const city = cities.find((item) => item._id === cityId);
        const area = areas.find((item) => item._id === resolvedAreaId) || result?.area;

        if (!result?.available || !state || !city || !area || !pin) {
          throw new Error(result?.message || "Service is unavailable for this pincode.");
        }

        const selected = {
          version: STORAGE_VERSION,
          ownerKey: currentLocationOwner(),
          serviceAvailable: true,
          detectedAt: new Date().toISOString(),
          coordinates: null,
          state,
          city,
          area,
          pincode: pin,
          distance: null,
          radius: area.radius,
          message: "Location and pincode selected manually.",
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
        setLocation(selected);
      } catch (error) {
        showLocationError(error.message);
        throw error;
      } finally {
        setLoadingLocation(false);
      }
    },
    [areas, cities, pincodes, showLocationError, states],
  );

  const refreshLocation = useCallback(() => {
    detectLocation(true);
  }, [detectLocation]);

  const saveExactAddress = useCallback(async (address) => {
    const exactAddress = String(address || "").trim();
    if (!exactAddress) throw new Error("Enter your complete service address.");
    const typedPincode = exactAddress.match(/\b[0-9]{6}\b/)?.[0] || "";

    if (!typedPincode) {
      const error = new Error("Complete address ke saath 6 digit pincode bhi enter karein.");
      showLocationError(error.message);
      throw error;
    }

    try {
        const catalog = await ensureCatalog();
        const addressText = exactAddress.toLowerCase();
        const candidates = catalog.pincodes.filter((item) => item.code === typedPincode && item.isActive !== false && item.serviceAvailable !== false);
        const pin = candidates.find((item) => {
          const areaId = typeof item.areaId === "object" ? item.areaId?._id : item.areaId;
          const area = catalog.areas.find((entry) => entry._id === areaId);
          return area?.name && addressText.includes(area.name.toLowerCase());
        }) || candidates[0];
        if (!pin) throw new Error(`Service is not active for pincode ${typedPincode}.`);

        const stateId = typeof pin.stateId === "object" ? pin.stateId?._id : pin.stateId;
        const cityId = typeof pin.cityId === "object" ? pin.cityId?._id : pin.cityId;
        const areaId = typeof pin.areaId === "object" ? pin.areaId?._id : pin.areaId;
        const state = catalog.states.find((item) => item._id === stateId);
        const city = catalog.cities.find((item) => item._id === cityId);
        const area = catalog.areas.find((item) => item._id === areaId);
        if (!state || !city || !area) throw new Error("Address pincode mapping is incomplete.");

        const result = await checkAreaAvailability({ stateId, cityId, areaId, pincodeId: pin._id, pincode: pin.code });
        if (!result?.available) throw new Error(result?.message || `Service is not active for pincode ${typedPincode}.`);
        const selected = {
          version: STORAGE_VERSION,
          ownerKey: currentLocationOwner(),
          serviceAvailable: true,
          detectedAt: new Date().toISOString(),
          coordinates: null,
          state,
          city,
          area: { ...area, exactAddress },
          pincode: pin,
          distance: null,
          radius: area.radius,
          message: "Exact address saved and verified by pincode.",
          addressSource: "manual",
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
        setLocation(selected);
        setLocationError("");
        return selected;
    } catch (error) {
      showLocationError(error.message);
      throw error;
    }
  }, [ensureCatalog, showLocationError]);

  const selectedState = location?.state || null;
  const selectedCity = location?.city || null;
  const selectedArea = location?.area || null;
  const selectedPincode = location?.pincode || null;

  const value = useMemo(
    () => ({
      states,
      cities,
      areas,
      pincodes,
      selectedState,
      selectedCity,
      selectedArea,
      selectedPincode,
      selectedStateId: selectedState?._id || "",
      selectedCityId: selectedCity?._id || "",
      selectedAreaId: selectedArea?._id || "",
      selectedPincodeId: selectedPincode?._id || "",
      loadingLocation,
      locationError,
      coordinates: location?.coordinates || null,
      serviceAvailable: Boolean(location?.serviceAvailable),
      refreshLocation,
      saveExactAddress,
      selectManualLocation,
      ensureCatalog,
    }),
    [
      states,
      cities,
      areas,
      pincodes,
      selectedState,
      selectedCity,
      selectedArea,
      selectedPincode,
      loadingLocation,
      locationError,
      location?.coordinates,
      location?.serviceAvailable,
      refreshLocation,
      saveExactAddress,
      selectManualLocation,
      ensureCatalog,
    ],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
