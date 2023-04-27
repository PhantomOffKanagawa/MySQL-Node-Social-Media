import React, { useState, useRef, onEffect, useEffect } from "react";
import "../../App.css";
import PostCreator from "./PostCreator";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import EditModal from "./EditModal";

const Footer = (props) => {
  const simpleIsLogged = props.simpleIsLogged;
  const editable = props.editable;
  const [height, setHeight] = useState(0);
  const ref = useRef(null);

  const setTheHeight = () => {
    console.log(ref.current.clientHeight)
    document.body.style.marginBottom = ref.current.clientHeight + "px";
  };
  window.addEventListener("resize", setTheHeight);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [eshow, setEShow] = useState(false);

  const handleEClose = () => setEShow(false);
  const handleEShow = () => setEShow(true);

  useEffect(() => {
    document.body.style.marginBottom = ref.current.clientHeight + "px";
  }, [])

  return (
    <footer
      ref={ref}
      className="bg-light text-center vw-100 position-fixed bottom-0"
    >
      <div className="container p-4">
        {typeof simpleIsLogged != "undefined" && simpleIsLogged && (
          <span>
            <a
              href="/logout"
              type="button"
              className="btn btn-outline-secondary mx-1"
              data-mdb-ripple-color="#000000"
            >
              Logout
            </a>
            <a
              href="/myaccount"
              type="button"
              className="btn btn-outline-secondary mx-1"
              data-mdb-ripple-color="#000000"
            >
              <i className="fa-solid fa-user"></i>
            </a>
          </span>
        )}
        {typeof editable != "undefined" && editable && (
          <button
            type="button"
            className="btn btn-outline-warning btn-floating mx-1"
            data-mdb-ripple-color="#ffffff"
            onClick={handleEShow}
          >
            Edit
            <i className="fas fa-edit"></i>
          </button>
        )}
        {typeof simpleIsLogged != "undefined" && simpleIsLogged && (
          <button
            type="button"
            className="btn btn-outline-success btn-floating mx-1"
            data-mdb-ripple-color="#ffffff"
            onClick={handleShow}
          >
            Post
            <i className="fas fa-pen-nib"></i>
          </button>
        )}
      </div>
      {simpleIsLogged != "undefined" && simpleIsLogged && (
        <PostCreator show={show} handleClose={handleClose} />
      )}
      {editable != "undefined" && editable && (
        <EditModal show={eshow} handleClose={handleEClose} />
      )}
    </footer>
  );
};

export default Footer;
