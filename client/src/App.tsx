import { useAuth } from "@/hooks/useAuth";
import { Switch, Route } from "wouter";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

function Router() {
  const { isAuthenticated, isLoading, showRegister, register, closeRegister, selectedTab } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading MindPilot AI...</p>
        </div>
      </div>
    );
  }

  // Show registration page
  if (showRegister && !isAuthenticated) {
    return (
      <Register 
        onRegister={register} 
        onBack={closeRegister}
        selectedTab={selectedTab || undefined}
      />
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/tasks" component={Dashboard} />
          <Route path="/finance" component={Dashboard} />
          <Route path="/wellness" component={Dashboard} />
          <Route path="/profile" component={Dashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return <Router />;
}
