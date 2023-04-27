import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

const Logout = (props) => {

  // Define the state with useState hook
  const navigate = useNavigate();

  useEffect(() => {
    axios
    .get('/api/logout')
      .then((res) => {;

        setTimeout(() => {
          navigate('/');
        }, 2500)
      })
      .catch((err) => {
      });
    }, []);


  return (
    <div className="px-4 py-5 my-5 text-center">
        <h1 className="display-5 fw-bold">You Are Logged Out</h1>
        <h3 className="fw-bold">Redirecting...</h3>
    </div>
  );
};

export default Logout;