import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "../utils/toast";
import { getFreshServicePlans } from "../services/api";
const CartContext = createContext(null);
const SERVICE_KEY = "localpintu-cart-v1";
const PRODUCT_KEY = "localpintu-product-cart-v1";
const read = (key) => { try { const value = JSON.parse(typeof localStorage!=="undefined"?(localStorage.getItem(key)||"[]"):"[]"); return Array.isArray(value) ? value : []; } catch { return []; } };
const withoutEmbeddedImage = (item) => String(item?.image || "").startsWith("data:image/") ? { ...item, image: "" } : item;
const persist = (key, value) => { try { localStorage.setItem(key, JSON.stringify(Array.isArray(value) ? value.map(withoutEmbeddedImage) : value)); } catch { /* Cart must keep working when browser storage is full/unavailable. */ } };
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => read(SERVICE_KEY));
  const [productItems, setProductItems] = useState(() => read(PRODUCT_KEY));
  useEffect(() => {
    if (!items.length) return;
    getFreshServicePlans().then((plans) => {
      const currentById = new Map(plans.map((plan) => [String(plan._id), plan]));
      setItems((current) => {
        const next = current.map((item) => {
          const plan = currentById.get(String(item.planId));
          return plan ? { ...item, image: plan.image || item.image, price: plan.price, offerPrice: plan.offerPrice, platformFee: plan.platformFee ?? 5, customerPrice: plan.customerPrice, regularCustomerPrice: plan.regularCustomerPrice } : item;
        });
        persist(SERVICE_KEY, next);
        return next;
      });
    }).catch(() => {});
  // Refresh persisted cart snapshots once when the cart provider mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const addItem = useCallback((item) => setItems((current) => { const existing = current.find((entry) => entry.planId === item.planId); const next = existing ? current.map((entry) => entry.planId === item.planId ? { ...entry, image: item.image || entry.image, quantity: Math.max(1, Number(entry.quantity || 1) + 1), addedAt: new Date().toISOString() } : entry) : [...current, { ...item, quantity: 1, addedAt: new Date().toISOString() }]; persist(SERVICE_KEY, next); toast.success(existing ? "Service quantity increased" : "Service added to your cart", { description: item.planTitle || "Your selected service is ready.", action: { label: "View cart", onClick: () => { window.location.href = "/cart"; } } }); return next; }), []);
  const removeItem = useCallback((planId) => setItems((current) => { const next = current.filter((item) => item.planId !== planId); persist(SERVICE_KEY, next); toast.info("Service removed from cart"); return next; }), []);
  const updateItemQuantity = useCallback((planId, quantity) => setItems((current) => { const next = current.flatMap((item) => { if (item.planId !== planId) return [item]; const safeQuantity = Math.max(0, Math.floor(Number(quantity) || 0)); return safeQuantity ? [{ ...item, quantity: safeQuantity }] : []; }); persist(SERVICE_KEY, next); return next; }), []);
  const addProduct = useCallback((product) => setProductItems((current) => { const exists = current.some((item) => item.productId === product.productId); if (exists) { toast.info("Product is already in your cart", { description: product.name }); return current; } const next = [...current, { ...withoutEmbeddedImage(product), addedAt: new Date().toISOString() }]; persist(PRODUCT_KEY, next); toast.success("Recommended product added", { description: product.name, action: { label: "View cart", onClick: () => { window.location.href = "/cart"; } } }); return next; }), []);
  const removeProduct = useCallback((productId) => setProductItems((current) => { const removed = current.find((item) => item.productId === productId); const next = current.filter((item) => item.productId !== productId); persist(PRODUCT_KEY, next); toast.info("Product removed from cart", { description: removed?.name }); return next; }), []);
  const clearCart = useCallback(() => { setItems([]); setProductItems([]); persist(SERVICE_KEY, []); persist(PRODUCT_KEY, []); }, []);
  const serviceSubtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.offerPrice ?? item.price ?? 0) * Math.max(1, Number(item.quantity || 1)), 0), [items]);
  const servicePlatformFee = useMemo(() => items.reduce((sum, item) => sum + Number(item.platformFee ?? 5) * Math.max(1, Number(item.quantity || 1)), 0), [items]);
  const productSubtotal = useMemo(() => productItems.reduce((sum, item) => sum + Number(item.price ?? 0), 0), [productItems]);
  const count = useMemo(() => items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity || 1)), 0) + productItems.length, [items, productItems]);
  const value = useMemo(() => ({ items, productItems, count, serviceSubtotal, servicePlatformFee, productSubtotal, subtotal: serviceSubtotal + productSubtotal, addItem, removeItem, updateItemQuantity, addProduct, removeProduct, clearCart }), [items, productItems, count, serviceSubtotal, servicePlatformFee, productSubtotal, addItem, removeItem, updateItemQuantity, addProduct, removeProduct, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
