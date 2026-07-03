import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/common/Navbar/Navbar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white">
      {/* উপরের মেইন নেভিগেশন বার */}
      <Navbar />
      
      {/* নিচে ড্যাশবোর্ড পেজ (যেখানে কোনো ডাবল সাইডবার থাকবে না) */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}