import { useConvexAuth } from "convex/react";
import { Redirect } from "expo-router";
import { LoginScreen } from "@/screens/login";
import { LoadingView } from "@/components/loading-view";

export default function LoginRoute() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) return <LoadingView />;
  if (isAuthenticated) return <Redirect href="/" />;
  return <LoginScreen />;
}
