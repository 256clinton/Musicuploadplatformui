import { createBrowserRouter } from "react-router";
import App from "./App";
import { AdminDashboard } from "./pages/AdminDashboard";
import { UserDashboard } from "./pages/UserDashboard";
import { Login } from "./pages/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/dashboard",
    Component: UserDashboard,
  },
]);
