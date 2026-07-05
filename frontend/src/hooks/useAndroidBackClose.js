import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export const useAndroidBackClose = (isOpen, close) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener;

    const setup = async () => {
      listener = await CapacitorApp.addListener("backButton", () => {
        if (isOpen) {
          close();
        } else {
          window.history.back();
        }
      });
    };

    setup();

    return () => {
      if (listener) listener.remove();
    };
  }, [isOpen, close]);
};