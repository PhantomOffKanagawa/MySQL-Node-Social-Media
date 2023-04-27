import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import Index from './components/Index';
import MyAccount from './components/MyAccount';
import Account from './components/Account';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route exact path='/' element={<Index />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/myaccount' element={<MyAccount />} />
          <Route path='/logout' element={<Logout />} />
          <Route path='/account/:username' element={<Account />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;