import { useEffect, useRef } from "react";
import { bootstrapApp } from "@/core/bootstrap/app.bootstrap";

export function useAppBootstrap() {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void bootstrapApp();
  }, []);
}

