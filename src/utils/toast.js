let modulePromise;
const load=()=>{window.dispatchEvent(new Event("localpintu:toast"));modulePromise ||= import("sonner");return modulePromise};
const notify=(type,message,options)=>load().then(({toast})=>toast[type](message,options));
export const toast={success:(message,options)=>notify("success",message,options),error:(message,options)=>notify("error",message,options),info:(message,options)=>notify("info",message,options)};