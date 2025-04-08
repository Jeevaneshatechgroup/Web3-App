import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { Web3Provider } from "@/context/Web3Context";
import { VotingProvider } from "@/context/VotingContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <VotingProvider>
          <Router />
          <Toaster />
        </VotingProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default App;
