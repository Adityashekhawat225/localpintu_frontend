import { useEffect } from "react";

const MINIMUM_LOADER_TIME = 2800;

function InitialLoader({ children }) {
  useEffect(() => {
    const loader = document.getElementById("app-loader");
    const content = loader?.querySelector(".app-loader__content");
    if (!loader || !content) return undefined;

    const isMobile = window.matchMedia("(max-width: 480px)").matches;
    let hideTimer;
    let leaveTimer;
    let done = false;
    const mountedAt = performance.now();

    const positionMobileLoader = () => {
      if (!isMobile) return;
      const viewport = window.visualViewport;
      const width = viewport?.width ?? window.innerWidth;
      const height = viewport?.height ?? window.innerHeight;
      const top = (viewport?.offsetTop ?? 0) + height / 2;
      const left = (viewport?.offsetLeft ?? 0) + width / 2;
      content.style.setProperty("top", `${Math.round(top)}px`, "important");
      content.style.setProperty("left", `${Math.round(left)}px`, "important");
    };

    // The loader is a fixed full-screen layer, so it does not need to mutate
    // html/body overflow. Inline scroll locks could otherwise survive a
    // delayed mobile load event and leave the page unscrollable.
    positionMobileLoader();
    const viewport = window.visualViewport;
    if (isMobile) {
      viewport?.addEventListener("resize", positionMobileLoader);
      viewport?.addEventListener("scroll", positionMobileLoader);
      window.addEventListener("orientationchange", positionMobileLoader);
      window.addEventListener("resize", positionMobileLoader);
    }

    const restorePage = () => {
      content.style.removeProperty("top");
      content.style.removeProperty("left");
    };
    const hideLoader = () => {
      if (done) return;
      done = true;
      const remaining = Math.max(0, MINIMUM_LOADER_TIME - (performance.now() - mountedAt));
      hideTimer = window.setTimeout(() => {
        restorePage();
        loader.classList.add("app-loader--leaving");
        leaveTimer = window.setTimeout(() => { loader.style.pointerEvents = "none"; }, 300);
      }, remaining);
    };

    if (document.readyState === "complete") hideLoader();
    else window.addEventListener("load", hideLoader, { once: true });
    const safetyId = window.setTimeout(hideLoader, 1800);

    return () => {
      window.removeEventListener("load", hideLoader);
      viewport?.removeEventListener("resize", positionMobileLoader);
      viewport?.removeEventListener("scroll", positionMobileLoader);
      window.removeEventListener("orientationchange", positionMobileLoader);
      window.removeEventListener("resize", positionMobileLoader);
      window.clearTimeout(hideTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(safetyId);
      restorePage();
    };
  }, []);

  return children;
}

export default InitialLoader;
