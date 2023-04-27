import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

const Register = (props) => {

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
    .post('/api/register', newlogin)
      .then((res) => {
        console.log(res)
        setNewLogin({
            username: '',
            password: ''
        });

        navigate('/login');
      })
      .catch((err) => {
        alert(err.response.data.msg);
        console.log('Error in Register!' + err.response.data.msg);
      });
  };

  return (
    <div className="px-4 py-5 my-5 text-center">
        <img className="d-block mx-auto mb-4" src="https://uilogos.co/img/logomark/u-mark.png" alt="" width="auto" height="150" />
        <h1 className="display-5 fw-bold">Register Here</h1>
        <div className="col-lg-3 mx-auto">
            <form onSubmit={onSubmit}>
                <div className="mb-4">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input type="text" required className="form-control" name="username" placeholder="Username" pattern="^[-a-zA-Z0-9@:%._\+~#=]*$"
                  onChange={onChange} />
                    <span className="help-block">Letters, Numbers and "@:%._\+~#=" only</span>
                </div>
                <div className="mb-2">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" required className="form-control" name="password" placeholder="Password"
                  onChange={onChange} />
                </div>
                <button type="submit" className="btn btn-primary mt-2 mb-4">Submit</button>
                <p>Already a member? <a href="/login">Login</a></p>
            </form>
        </div>
    </div>
  );
};

export default Register;