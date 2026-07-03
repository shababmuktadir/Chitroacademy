import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar/Navbar';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 🔥 আপনার তৈরি করা একদম অক্ষত ডিজাইনের Navbar */}
      <Navbar />
      
      {/* পেজের মূল কন্টেন্ট এখানে রেন্ডার হবে */}
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}