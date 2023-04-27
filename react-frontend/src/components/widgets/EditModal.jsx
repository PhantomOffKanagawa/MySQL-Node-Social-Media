import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../../App.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditModal = (props) => {
  const show = props.show;
  const handleClose = props.handleClose;
  
  const navigate = useNavigate();
  const [account, setAccount] = useState({
    birthday: '',
    location: '',
    description: ''
  });

  const onChange = (e) => {
    setAccount({ ...account, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    axios
    .post('/api/myaccount', account)
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
        <Modal.Title>Edit Account Details</Modal.Title>
      </Modal.Header>
      <form class="form-horizontal" onSubmit={onSubmit}>
        <Modal.Body>
                        <div class="form-group mb-2">
                            <label class="control-label" for="birthday">Birthday</label>
                            <div class="">
                                <input id="birthday" name="birthday" type="text" placeholder="2020-03-01"
                                    class="form-control mb-1" maxlength="10"
                                    pattern="^\d{4}[-]((((0[13578])|([13578])|(1[02]))[-](([1-9])|([0-2][0-9])|(3[01])))|(((0[469])|([469])|(11))[-](([1-9])|([0-2][0-9])|(30)))|((2|02)[-](([1-9])|([0-2][0-9])))){1}$"
                                    onChange={onChange} />
                                <span class="help-block">(YYYY-MM-DD)</span>
                            </div>
                        </div>

                        <div class="form-group mb-2">
                            <label class="control-label" for="location">Location</label>
                            <div class="">
                                <input id="location" name="location" type="text" placeholder="Heaven or Hell"
                                    class="form-control mb-1" maxlength="255"
                                    onChange={onChange} />
                            </div>
                        </div>

                        <div class="form-group mb-3">
                            <label class="control-label" for="description">Description</label>
                            <div class="">
                                <textarea class="form-control mb-1" id="description" name="description"
                                    placeholder="A description" maxlength="255"
                                    onChange={onChange}></textarea>
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

export default EditModal;
