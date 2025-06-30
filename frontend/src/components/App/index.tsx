import { Outlet } from 'react-router-dom';
// import Footer from '../Footer';
import { useState } from 'react';
import Navbar from '../Navbar';

const App = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');

  return (
    <div className="flex flex-col h-screen">
      <Navbar
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
      />
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <Outlet />
      </main>

      {/* Pied de page */}
      {/* <Footer /> */}
    </div>
  );
};

export default App;
