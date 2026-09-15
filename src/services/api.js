import { API_BASE } from "./apiConfig";
const buildUrl=(path,params)=>{const url=new URL(`${API_BASE}${path}`,typeof window!=="undefined"?window.location.origin:"http://localhost");Object.entries(params||{}).forEach(([key,value])=>{if(value!==undefined&&value!==null&&value!=="")url.searchParams.set(key,value)});return url.toString()};
const wait=(milliseconds)=>new Promise(resolve=>window.setTimeout(resolve,milliseconds));
const fetchWithRetry = async (url, options, attempts) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      // Retry temporary gateway failures once; repeating an application 500
      // only delays the error and adds load to an already failing endpoint.
      if (![502, 503, 504].includes(response.status) || attempt === attempts - 1) return response;
      await response.body?.cancel();
    } catch (error) {
      if (controller.signal.aborted) throw new Error("Request timed out. Please try again.", { cause: error });
      if (attempt === attempts - 1) throw error;
    } finally {
      clearTimeout(timeout);
    }
    await wait(350);
  }
  throw new Error("Request failed");
};
const request=async(method,path,data,config={},withCustomerAuth=true)=>{const headers={...(config.headers||{})};if(withCustomerAuth&&typeof localStorage!=="undefined"){try{const token=JSON.parse(localStorage.getItem("localpintu-auth")||"{}").token;if(token)headers.Authorization=`Bearer ${token}`}catch{/* malformed legacy session */}}const options={method,headers,cache:"default"};if(data!==undefined&&method!=="GET"){if(data instanceof FormData)options.body=data;else{headers["Content-Type"]="application/json";options.body=JSON.stringify(data)}}const response=await fetchWithRetry(buildUrl(path,config.params),options,method==="GET"?2:1);const payload=response.status===204?{}:await response.json().catch(()=>({}));if(!response.ok){const error=new Error(payload?.message||`Request failed (${response.status})`);error.status=response.status;error.code=payload?.code;throw error}return{data:payload}};
const publicPrefixes=["/appliance-services","/pricing-settings","/service-categories","/child-services","/service-plans","/products","/offers","/states","/cities","/areas","/pincodes","/blogs"];
const publicGetCache=new Map(),publicGetInFlight=new Map(),PUBLIC_GET_TTL=60*1000;
const cachedGet=(path,config)=>{
  const isPublic=publicPrefixes.some(prefix=>path.startsWith(prefix));
  if(!isPublic)return request("GET",path,undefined,config);
  const key=buildUrl(path,config?.params),cached=publicGetCache.get(key);
  if(cached&&Date.now()-cached.time<PUBLIC_GET_TTL)return Promise.resolve(cached.response);
  if(publicGetInFlight.has(key))return publicGetInFlight.get(key);
  const pending=request("GET",path,undefined,config).then(response=>{publicGetCache.set(key,{time:Date.now(),response});return response}).finally(()=>publicGetInFlight.delete(key));
  publicGetInFlight.set(key,pending);
  return pending;
};
const apiClient={get:cachedGet,post:(path,data,config)=>request("POST",path,data,config),put:(path,data,config)=>request("PUT",path,data,config),patch:(path,data,config)=>request("PATCH",path,data,config),delete:(path,config)=>request("DELETE",path,undefined,config)};
const technicianClient={get:(path,config)=>request("GET",path,undefined,config,false),post:(path,data,config)=>request("POST",path,data,config,false),patch:(path,data,config)=>request("PATCH",path,data,config,false)};
const unwrap = (response, key) => response.data?.[key] || [];

const activeOnly = (items) =>
  items.filter((item) => item.isActive !== false);

// Share one request across all visible catalogue sections. The short cache
// avoids repeated slow loads while still showing admin catalogue changes soon.
const getFreshCatalog = async (path, key) =>
  activeOnly(unwrap(await apiClient.get(path), key));

/* ============================
   PUBLIC APIs
============================ */

export const getPricingSettings = async () =>
  (await apiClient.get("/pricing-settings")).data.data;

export const getSiteSettings = getPricingSettings;

export const getApplianceServices = async () =>
  getFreshCatalog("/appliance-services", "services");

export const getTrendingServices = async () =>
  activeOnly(unwrap(await apiClient.get("/appliance-services/trending"), "services"));

export const getServiceCategories = async () =>
  getFreshCatalog("/service-categories", "serviceCategories");

export const getChildServices = async () =>
  getFreshCatalog("/child-services", "childServices");

export const getServicePlans = async () =>
  getFreshCatalog("/service-plans", "servicePlans");

export const getServicePlan = async (id) =>
  (await apiClient.get(`/service-plans/${encodeURIComponent(id)}`)).data.servicePlan;

export const getFreshServicePlans = async () =>
  getFreshCatalog("/service-plans", "servicePlans");

export const getProducts = async (params = {}) =>
  activeOnly(unwrap(await apiClient.get("/products", { params }), "products"));

export const getOffers = async (params = {}) =>
  unwrap(await apiClient.get("/offers", { params }), "offers");

export const validateOffer = async (payload) =>
  unwrap(await apiClient.post("/offers/validate", payload), "validation");

export const getStates = async () =>
  activeOnly(
    unwrap(await apiClient.get("/states"), "states")
  );

export const getCities = async () =>
  activeOnly(
    unwrap(await apiClient.get("/cities"), "cities")
  );

export const getAreas = async () =>
  activeOnly(
    unwrap(await apiClient.get("/areas"), "areas")
  );

export const getPincodes = async () =>
  activeOnly(unwrap(await apiClient.get("/pincodes"), "pincodes"));

export const checkAreaAvailability = async ({ areaId, stateId, cityId, pincodeId, pincode }) =>
  (await apiClient.get("/areas/availability", { params: { areaId, stateId, cityId, pincodeId, pincode } })).data;

/* ==================================
   LIVE LOCATION API (NEW)
================================== */

export const findNearestArea = async ({
  latitude,
  longitude,
  pincode,
}) =>
  (
    await apiClient.post("/areas/nearest", {
      latitude: Number(latitude),
      longitude: Number(longitude),
      ...(pincode ? { pincode } : {}),
    })
  ).data;

export const compareLocationWithAdminData = async ({
  latitude,
  longitude,
}) =>
  (
    await apiClient.post("/areas/compare-location", {
      latitude: Number(latitude),
      longitude: Number(longitude),
    })
  ).data;

export const getBlogs = async () =>
  activeOnly(
    unwrap(await apiClient.get("/blogs"), "blogs")
  );

export const getBlogBySlug = async (slug) =>
  (await apiClient.get(`/blogs/slug/${encodeURIComponent(slug)}`)).data.blog || null;

export const getLatestBlogs = async () =>
  activeOnly(
    unwrap(await apiClient.get("/blogs/latest"), "blogs")
  );

export const bySlug = (items, slug) =>
  items.find((item) => String(item.slug).toLowerCase() === String(slug).toLowerCase());

export const byId = (items, id) =>
  items.find((item) => item._id === id);

export const createBooking = async (payload) =>
  (
    await apiClient.post("/bookings", payload)
  ).data?.booking;

export const createRazorpayOrder = async (bookingIds) =>
  (await apiClient.post("/payments/razorpay/order", { bookingIds })).data;

export const verifyRazorpayPayment = async (payload) =>
  (await apiClient.post("/payments/razorpay/verify", payload)).data;

export const initiatePayuPayment = async (bookingIds) =>
  (await apiClient.post("/payments/payu/initiate", { bookingIds })).data;

export const getBookingById = async (id) =>
  (
    await apiClient.get(`/bookings/${id}`)
  ).data?.booking || null;

export const signup = async (payload) =>
  (
    await apiClient.post("/auth/signup", payload)
  ).data;

export const login = async (payload) =>
  (
    await apiClient.post("/auth/login", payload)
  ).data;

export const verifySignupOtp = async (payload) =>
  (await apiClient.post("/auth/signup/verify-otp", payload)).data;

export const verifyLoginOtp = async (payload) =>
  (await apiClient.post("/auth/login/verify-otp", payload)).data;

export const logout = async () =>
  (
    await apiClient.post("/auth/logout")
  ).data;

export const getProfile = async () =>
  (
    await apiClient.get("/auth/profile")
  ).data.customer;

export const updateProfile = async (payload) =>
  (
    await apiClient.put("/auth/profile", payload)
  ).data.customer;
  export const changePassword = async (payload) =>
  (
    await apiClient.put("/auth/change-password", payload)
  ).data;

export const getMyBookings = async () =>
  (
    await apiClient.get("/bookings/my")
  ).data.bookings || [];

export const getSlotAvailability = async (params) =>
  (await apiClient.get("/bookings/slot-availability", { params })).data.slots || [];

/* ==================================
   TECHNICIAN API
================================== */

export const technicianLogin = async (payload) =>
  (
    await technicianClient.post(
      "/technicians/login",
      payload
    )
  ).data;

export const technicianMyJobs = async (token) =>
  (
    await technicianClient.get(
      "/technicians/me/jobs",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  ).data.jobs || [];

export const technicianJobAction = async (
  token,
  id,
  action
) =>
  (
    await technicianClient.patch(
      `/technicians/me/jobs/${id}/${action}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  ).data.job;

export const technicianLogout = async (token) =>
  (
    await technicianClient.post(
      "/technicians/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  ).data;

/* ==================================
   EXPORT
================================== */

export default apiClient;









