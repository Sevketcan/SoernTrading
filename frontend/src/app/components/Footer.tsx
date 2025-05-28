"use client";

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Admin Panel. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 