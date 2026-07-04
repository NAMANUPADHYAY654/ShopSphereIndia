import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import Chatbot from '../Chatbot';

const CustomerLayout = () => {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
};

export default CustomerLayout;
