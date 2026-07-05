

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isAndroidBuild = process.env.VITE_BUILD_TARGET === "android";

export default defineConfig({
  plugins: [react()],
  base: isAndroidBuild ? "./" : "/Blood-Bank-Donor-Management-System/",
});