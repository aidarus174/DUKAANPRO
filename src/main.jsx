import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

class AppErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = {error:null}; }
  static getDerivedStateFromError(error){ return {error}; }
  render(){
    if(this.state.error){
      return <div className="fatal-error"><div><div className="brand">DUKAANPRO</div><h1>Something went wrong</h1><p>The application could not start safely. Please refresh the page.</p><details><summary>Technical details</summary><pre>{String(this.state.error?.message || this.state.error)}</pre></details><button onClick={()=>location.reload()}>Reload</button></div></div>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(<AppErrorBoundary><App/></AppErrorBoundary>);
