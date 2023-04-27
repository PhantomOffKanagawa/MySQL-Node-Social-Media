import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../../App.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PostCreator = (props) => {
  const show = props.show;
  const handleClose = props.handleClose;
  
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState({
    contents: ''
  });

  const onChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    axios
    .post('/api/newpost', newPost)
      .then((res) => {
        window.location.reload();
      })
      .catch((err) => {
        console.log(err)
      });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Post</Modal.Title>
      </Modal.Header>
      <form class="form-horizontal" onSubmit={onSubmit}>
        <Modal.Body>
          <div class="form-group mb-4 position-relative">
            <label class="control-label" for="contents">
              Post Contents
            </label>
            <div class="">
              <textarea
                class="form-control mb-1"
                id="contents"
                name="contents"
                placeholder="Enter the post here... (255 character limit)"
                maxlength="255"
                minlength="1"
                required
                onChange={onChange}
              ></textarea>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <input
            type="submit"
            id="submit"
            name="submit"
            class="btn btn-success"
          />
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default PostCreator;
