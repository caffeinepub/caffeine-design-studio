import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DesignEditor from "./components/DesignEditor";
import { CanvasContext, useCanvas } from "./hooks/useCanvas";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function CanvasProvider({ children }: { children: React.ReactNode }) {
  const canvas = useCanvas();
  return (
    <CanvasContext.Provider value={canvas}>{children}</CanvasContext.Provider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CanvasProvider>
        <DesignEditor />
        <Toaster position="bottom-right" theme="dark" />
      </CanvasProvider>
    </QueryClientProvider>
  );
}
