import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import Footer from "./widgets/Footer";
import Header from "./widgets/Header";
import { useNavigate } from "react-router-dom";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";

const Index = (props) => {
  const [simpleIsLogged, setSimpleIsLogged] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/accounts")
      .then((res) => {
        setSimpleIsLogged(res.data.simpleIsLogged);
        setAccounts(res.data.accounts);
      })
      .catch((err) => {});
  }, []);

  const searchItems = (searchValue) => {
    setSearchInput(searchValue);
    if (searchInput !== "") {
      const filteredData = accounts.filter((item) => {
        return Object.values(item)
          .join("")
          .toLowerCase()
          .includes(searchInput.toLowerCase());
      });
      setFilteredResults(filteredData);
    } else {
      setFilteredResults(accounts);
    }
  };

  return (
    <div>
      <Header simpleIsLogged={simpleIsLogged} />

      <div class="px-4 py-5 mt-3 mb-5 text-center min-vh-100">
        <img
          class="d-block mx-auto mb-4"
          src="https://uilogos.co/img/logomark/u-mark.png"
          alt=""
          width="auto"
          height="150"
        />
        <h1 class="display-5 fw-bold">The Landing Page</h1>
        <div class="col-lg-6 mx-auto">
          <p class="lead mb-4">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quod,
            quidem. Distinctio, natus, recusandae nostrum beatae provident aut
            quasi sequi eos nemo et quia dolor ipsum reprehenderit molestiae id
            facere sunt.
          </p>
          <div class="d-grid gap-2 d-sm-flex mb-5 justify-content-sm-center">
            { !simpleIsLogged && (
            <a
              type="button"
              class="btn btn-primary btn-lg px-4 gap-3 mb-5 me-2"
              href="/login"
            >
              Log In
            </a>
            )}
          </div>
        </div>
        <div class="section"></div>
      </div>



      <div className="container">
        <div style={{ padding: 20 }}>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">Username</InputGroup.Text>
            <Form.Control
              placeholder="Search..."
              aria-label="Search..."
              aria-describedby="basic-addon1"
              onChange={(e) => searchItems(e.target.value)}
            />
          </InputGroup>
          <ListGroup as="ol">
            {searchInput.length > 1
              ? filteredResults.map((item) => {
                  return (
                    <ListGroup.Item
                      as="li"
                      className="position-relative"
                      key={item.Username}
                    >
                      <div style={{display:"inline-block"}}>
                        <a href={"/account/" + item.Username} className="fw-bold">
                          {item.Username}
                        </a>
                      </div>
                      <Badge className="position-absolute end-0 mx-2 align-middle" bg="danger" pill>
                        {item.TotalLikes} Likes
                      </Badge>
                    </ListGroup.Item>
                  );
                })
              : accounts.map((item) => {
                  return (
                    <ListGroup.Item
                      as="li"
                      className="position-relative"
                      key={item.Username}
                    >
                      <div style={{display:"inline-block"}}>
                        <a href={"/account/" + item.Username} className="fw-bold">
                          {item.Username}
                        </a>
                      </div>
                      <Badge className="position-absolute end-0 mx-2 align-middle" bg="danger" pill>
                        {item.TotalLikes} Likes
                      </Badge>
                    </ListGroup.Item>
                  );
                })}
          </ListGroup>
        </div>
      </div>

      <Footer simpleIsLogged={simpleIsLogged} editable={false} />
    </div>
  );
};

export default Index;
