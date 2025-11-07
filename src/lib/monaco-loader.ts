"use client";

import loader from "@monaco-editor/loader";

if (typeof window !== "undefined") {
  // This initializes the loader and points it to where the worker files are served.
  // The webpack plugin in next.config.js handles copying the files.
  loader.init();
}