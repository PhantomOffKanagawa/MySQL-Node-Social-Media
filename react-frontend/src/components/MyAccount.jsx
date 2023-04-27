import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PostCard from "./widgets/PostCard";
import Footer from "./widgets/Footer";
import Header from "./widgets/Header";

import { useNavigate } from "react-router-dom";

const MyAccount = (props) => {
  const [posts, setPosts] = useState([]);
  const [simpleIsLogged, setSimpleIsLogged] = useState([]);
  const [user, setUser] = useState({
    Username: "N/A",
    Birthday: null,
    Description: null,
    Location: null,
  });
  const navigate = useNavigate();

  let count = 0;
  useEffect(() => {
    if (count != 0) return;
    count++;
    axios
      .get("/api/myaccount")
      .then((res) => {
        setPosts(res.data.posts);
        setUser(res.data.user);
        setSimpleIsLogged(res.data.simpleIsLogged)
        console.log(JSON.stringify(user));
      })
      .catch((err) => {
        alert("You aren't logged in");
        navigate('/login');
      });
  }, []);

  const postList =
    posts.length === 0
      ? <h3 className='text-center m-auto my-5 align-items-center align-self-center align-middle'>There are no posts</h3>
      : posts.map((post, k) => <PostCard post={post} key={k} />);

  return (
    <section className="min-vh-90">
    <Header simpleIsLogged={simpleIsLogged} />
      <div className="container py-5 position-relative">
        <div className="row">
          <div className="col-lg-4">
            <div className="card mb-4">
              <div className="card-body text-center">
                <h5 className="my-3">{user.Username}</h5>
                <p className="text-muted mb-4 editable" id="locationStatic">
                  {user.Location == null ? "N/A" : user.Location}
                </p>
              </div>
            </div>
            <div className="card mb-4 mb-lg-0">
              <div className="card-body p-0">
                <ul
                  className="list-group list-group-flush rounded-3"
                  id="linkHolder"
                ></ul>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-sm-3">
                    <p className="mb-0">Username</p>
                  </div>
                  <div className="col-sm-9">
                    <p className="text-muted mb-0">{user.Username}</p>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-sm-3">
                    <p className="mb-0">Birthday</p>
                  </div>
                  <div className="col-sm-9">
                    <p className="text-muted mb-0 editable" id="birthday">{user.Birthday == null ? "N/A" : new Date(user.Birthday).toDateString()}</p>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-sm-3">
                    <p className="mb-0">Location</p>
                  </div>
                  <div className="col-sm-9">
                    <p className="text-muted mb-0 editable" id="location">{user.Location == null ? "N/A" : user.Location}</p>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-sm-3">
                    <p className="mb-0">Description</p>
                  </div>
                  <div className="col-sm-9">
                    <p className="text-muted mb-0 editable" id="description">{user.Description == null ? "N/A" : user.Description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="container bg-light py-3 mb-5"
          style={{ minHeight: "100%", borderRadius: ".5em" }}
        >
          {postList}
        </div>
      </div>
      <Footer simpleIsLogged={simpleIsLogged} editable={true} />
    </section>
  );
};

export default MyAccount;
