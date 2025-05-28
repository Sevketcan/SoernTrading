"use client";

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <Header />
      </div>
      
      <div className="flex flex-1">
        <div className={`transition-all duration-500 delay-200 transform ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          <Sidebar />
        </div>
        
        <main className={`flex-1 p-6 transition-all duration-500 delay-300 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <div className={`transition-all duration-500 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout; 