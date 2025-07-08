
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Index />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
