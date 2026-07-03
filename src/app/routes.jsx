import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WatchCourse from '../pages/Courses/WatchCourse';
// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';
import ArtworkGallery from '../pages/ArtworkGallery';
// Pages
import HomePage from '../pages/Home/HomePage';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import FreeCourses from '../pages/Courses/FreeCourses';
import PaidCourses from '../pages/Courses/PaidCourses'; 
import Checkout from '../pages/Courses/Checkout';
import SearchPage from '../pages/Search/SearchPage';
import StudentDashboard from '../pages/Dashboard/Student/StudentDashboard';

// 🔥 নতুন যোগ করা ব্লগ পেজসমূহ
import Blog from '../pages/Blog';
import BlogPost from '../pages/BlogPost';

const CoursesRedirect = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  
  if (type === 'paid') {
    return <Navigate to="/courses/paid" replace />;
  }
  return <Navigate to="/courses/free" replace />;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
};

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/courses/play/:id" element={user ? <WatchCourse /> : <Navigate to="/login" />} />
        {/* অথেনটিকেশন রাউট */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        
        {/* মেইন ওয়েবসাইট (সব পেজ MainLayout এর ভেতরে থাকবে) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          
          {/* সমাধান: /artwork এবং /artworks দুটিতেই যেন গ্যালারি পেজটি দেখায় */}
          <Route path="/artworks" element={<ArtworkGallery />} />
          <Route path="/artwork" element={<ArtworkGallery />} />
          
          {/* 🔥 নতুন যোগ করা ব্লগের রাউটসমূহ */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          
          {/* Navbar এর ক্লিক হ্যান্ডেল করার রাউট */}
          <Route path="/courses" element={<CoursesRedirect />} />
          
          {/* কোর্স ও চেকআউট রাউট */}
          <Route path="/courses/free" element={<FreeCourses />} />
          <Route path="/courses/paid" element={<PaidCourses />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* সার্চ পেজ */}
          <Route path="/search" element={<SearchPage />} />
        </Route>

        {/* ড্যাশবোর্ড রাউট */}
        <Route path="/dashboard" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route path="student" element={<StudentDashboard />} />
        </Route>

        {/* ভুল কোনো ইউআরএল এ গেলে হোমপেজে রিডাইরেক্ট হবে */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}