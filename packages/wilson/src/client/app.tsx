import { Router, ReactLocation } from "@tanstack/react-location";
import React from "react";
import ReactDOM from "react-dom/client";
import routes from "virtual:wilson-routes";

const reactLocation = new ReactLocation();

export default function App() {
  return (
    <React.StrictMode>
      <Router location={reactLocation} routes={routes} />
    </React.StrictMode>
  );
}

if (!import.meta.env.SSR) {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <App />
  );
}
// } else {
//   ReactDOM.hydrateRoot(document.getElementById("root") as HTMLElement, <App />);
