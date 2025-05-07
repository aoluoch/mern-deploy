import { AlignJustify, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser, resetTokenAndCredentials } from "@/store/auth-slice";
import { useNavigate } from "react-router-dom";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(resetTokenAndCredentials());
    sessionStorage.clear();
    navigate("/auth/login");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          <Button
            onClick={() => setOpen(true)}
            variant="ghost"
            size="icon"
            className="lg:hidden"
          >
            <AlignJustify className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="h-9 lg:h-10 px-4 py-2"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline-block">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
