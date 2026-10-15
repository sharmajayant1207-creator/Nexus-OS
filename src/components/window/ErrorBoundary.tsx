import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  appName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Uncaught Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl text-center select-none">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide mb-1">
            Application Encountered an Issue
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4 font-mono leading-relaxed">
            {this.state.error?.message ||
              `The ${this.props.appName || 'application'} process experienced an unexpected runtime exception.`}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 font-medium text-xs transition-all shadow-md cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload App</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
