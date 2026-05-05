import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
          <div className="max-w-md w-full p-8 bg-card border border-border rounded-3xl shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>
              <h2 className="text-2xl font-display uppercase tracking-tight text-foreground mb-2">Something went wrong</h2>
              <p className="text-muted-foreground text-sm font-light">
                An unexpected error occurred. Please try refreshing the page or navigating back.
              </p>
            </div>
            <div className="flex gap-4 justify-center mt-8">
              <Button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20">
                Refresh Page
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'} className="rounded-xl border-border">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
