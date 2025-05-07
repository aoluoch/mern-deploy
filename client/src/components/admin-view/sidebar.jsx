import {
  Check,
  LayoutDashboard,
  Store,
  Home,
} from "lucide-react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <Store />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <Check />,
  },
];

function MenuItems({ setOpen }) {
  const navigate = useNavigate();

  return (
    <nav className="space-y-2">
      {adminSidebarMenuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          onClick={() => {
            navigate(menuItem.path);
            setOpen && setOpen(false);
          }}
          className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground text-muted-foreground"
        >
          {menuItem.icon}
          <span>{menuItem.label}</span>
        </div>
      ))}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const navigate = useNavigate();

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-full max-w-xs p-0 bg-background">
          <div className="flex flex-col h-full">
            <div className="border-b px-4 py-3">
              <div
                onClick={() => {
                  navigate("/admin/dashboard");
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2"
              >
                <Home size={24} />
                <h1 className="text-xl font-bold">Admin Panel</h1>
              </div>
            </div>
            <div className="flex-1 p-4">
              <MenuItems setOpen={setOpen} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden lg:flex w-64 shrink-0 border-r bg-background">
        <div className="flex flex-col h-full">
          <div className="border-b px-4 py-3">
            <div
              onClick={() => navigate("/admin/dashboard")}
              className="flex cursor-pointer items-center gap-2"
            >
                <Home size={24} />
                <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
          </div>
          <div className="flex-1 p-4">
            <MenuItems />
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSideBar;
