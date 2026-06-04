import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Checkout from './pages/Checkout';
import Corporate from './pages/Corporate';
import Subscription from './pages/Subscription';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <div className="min-h-screen flex flex-col selection:bg-brand-rust selection:text-white font-sans">
          <AnnouncementBar />
          <Navbar />
          <CartDrawer />
          <WhatsAppButton />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/corporate" element={<Corporate />} />
              <Route path="/delivery" element={<div className="pt-32 text-center h-screen font-display text-4xl">Delivery Tracking - Coming Soon</div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
