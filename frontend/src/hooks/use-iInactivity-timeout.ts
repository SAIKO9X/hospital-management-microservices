import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";

const useInactivityTimeout = (timeoutMinutes = 15) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performLogout = () => {
      console.log("Sessão expirada por inatividade. Realizando logout...");
      dispatch(logout());
      navigate("/auth");
    };

    // função para reiniciar o cronômetro
    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(
        performLogout,
        timeoutMinutes * 60 * 1000,
      );
    };

    // eventos que indicam que o usuário está ativo
    const activeEvents = [
      "mousemove",
      "keydown",
      "mousedown",
      "scroll",
      "touchstart",
    ];

    activeEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      activeEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [dispatch, navigate, timeoutMinutes]);
};

export default useInactivityTimeout;
