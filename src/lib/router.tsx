import { useCallback, useEffect, useState } from "react";

export type Route =
  | { name: "dashboard" }
  | { name: "students" }
  | { name: "newStudent" }
  | { name: "editStudent"; id: string }
  | { name: "viewStudent"; id: string };

export interface RouterState {
  route: Route;
  navigate: (route: Route) => void;
}

function readHash(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash;
}

export function parseRouteFromHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "");
  if (!clean) return { name: "dashboard" };

  const parts = clean.split("/").filter(Boolean);
  if (parts.length === 1 && parts[0] === "students") return { name: "students" };
  if (
    parts.length === 2 &&
    parts[0] === "students" &&
    parts[1] === "new"
  ) {
    return { name: "newStudent" };
  }
  if (
    parts.length === 3 &&
    parts[0] === "students" &&
    parts[2] === "edit"
  ) {
    return { name: "editStudent", id: parts[1] };
  }
  if (parts.length === 2 && parts[0] === "students") {
    return { name: "viewStudent", id: parts[1] };
  }

  return { name: "dashboard" };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "dashboard":
      return "#/";
    case "students":
      return "#/students";
    case "newStudent":
      return "#/students/new";
    case "editStudent":
      return `#/students/${route.id}/edit`;
    case "viewStudent":
      return `#/students/${route.id}`;
  }
}

export function useHashRouter(): RouterState {
  const [hash, setHashState] = useState<string>(readHash());

  useEffect(() => {
    function onChange() {
      setHashState(window.location.hash);
    }
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const route = parseRouteFromHash(hash);
  const navigate = useCallback((next: Route) => {
    const target = routeToHash(next);
    if (window.location.hash !== target) {
      window.location.hash = target;
    }
  }, []);
  return { route, navigate };
}
