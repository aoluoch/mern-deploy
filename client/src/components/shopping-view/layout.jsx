import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";

function ShoppingLayout() {
  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <ShoppingHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default ShoppingLayout;
