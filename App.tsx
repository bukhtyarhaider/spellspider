import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AppContent } from "./components/AppRouter";
import { ThemeProvider } from "./components/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <AppContent />
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
