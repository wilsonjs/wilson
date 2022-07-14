import React from "react";
import ReactDOM from "react-dom/client";
import AppComponent from "./components/app";
// @ts-ignore
import routes from "virtual:wilson/routes";

console.log({ routes });

function App() {
  return (
    <React.StrictMode>
      <AppComponent />
    </React.StrictMode>
  );
}

if (import.meta.env.SSR) {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <App />
  );
} else {
  ReactDOM.hydrateRoot(document.getElementById("root") as HTMLElement, <App />);
}
