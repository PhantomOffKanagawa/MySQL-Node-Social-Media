import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

const Login = (props) => {

  // Define the state with useState hook
  const navigate = useNavigate();
  const [newlogin, setNewLogin] = useState({
    username: '',
    password: ''
  });

  const onChange = (e) => {
    setNewLogin({ ...newlogin, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    axios
    .post('/api/login', newlogin)
      .then((res) => {
        setNewLogin({
            username: '',
            password: ''
        });

        navigate('/myaccount');
      })
      .catch((err) => {
        if (err.response.status == 404)
        alert("Incorrect Username and/or Password");
        console.log('Error in Register!' + JSON.stringify(err.response));
      });
  };

  return (
    <div className="px-4 py-5 my-5 text-center">
        <img className="d-block mx-auto mb-4" src="https://uilogos.co/img/logomark/u-mark.png" alt="" width="auto" height="150" />
        <h1 className="display-5 fw-bold">Login Here</h1>
        <div className="col-lg-3 mx-auto">
            <form onSubmit={onSubmit}>
                <div className="mb-2">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input type="text" className="form-control" name="username" placeholder="Username" onChange={onChange} required />
                </div>
                <div className="mb-2">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" name="password" placeholder="Password" onChange={onChange} required />
                </div>
                <button type="submit" className="btn btn-primary mt-2 mb-2">Submit</button>
                <div className="text-center">
                    <p>Not a member? <a href="/register">Register</a></p>
                </div>
            </form>
        </div>
    </div>
  );
};

export default Login;