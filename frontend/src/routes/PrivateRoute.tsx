import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Navigate, Outlet } from "react-router";
import { logout } from "@/store/slices/authSlice";
import { useEffect } from "react";
import useInactivityTimeout from "@/hooks/use-iInactivity-timeout";

export const PrivateRoute = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  // ativa o monitoramento de inatividade com limite de 15 minutos
  useInactivityTimeout(15);

  useEffect(() => {
    if (!token) {
      dispatch(logout());
    }
  }, [token, dispatch]);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};
