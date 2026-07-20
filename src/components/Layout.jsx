import React from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from '../home/AnnouncementBar/AnnouncementBar';
import Header from '../home/Header/Header';
import Footer from '../home/Footer/Footer';
import ScrollProgress from './common/ScrollProgress/ScrollProgress';
import BackToTop from './common/BackToTop/BackToTop';
import { ToastProvider } from '../context/ToastContext';

function Layout() {
  return (
    <ToastProvider>
      <div>
        <ScrollProgress />
        <AnnouncementBar />
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </ToastProvider>
  );
}

export default Layout;
