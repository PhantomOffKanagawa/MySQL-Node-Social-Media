import React from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import axios from 'axios';

const PostCard = (props) => {
  const post = props.post;

    const like = () => {
        axios
        .post('/api/likepost', {postID: post.ID, liked: post.LikedBySecondUser})
          .then((res) => {
            window.location.reload();
          })
          .catch((err) => {
            console.log(err)
          });
    }

  return (
<div className="card mb-4">
    <div className="card-header">
        <div className="d-flex justify-content-between align-items-center position-relative">
            <div className="d-flex justify-content-between align-items-center">
                <a className="link-dark" href="/account/{post.PosterUsername}">
                    <div className="ml-2">
                        <div className="h5 m-1">{post.PosterUsername}</div>
                    </div>
                </a>
            </div>
            <span className="help-block text-muted small position-absolute end-0">{post.ID}
        </span>
        </div>
        </div>
        <div className="card-body">
            <p className="card-text">
            {post.Contents}</p>
            <div>
            </div>
        </div>

        <div className="card-footer position-relative">
        <span>
            <button type="button" className="btn btn-sm btn-outline-danger btn-floating mx-1" data-mdb-ripple-color="#ffffff" onClick={like}>
                { post.LikedBySecondUser == 0 &&
                <i className="fa-regular fa-heart"></i>
                }
                {post.LikedBySecondUser == 1 &&
                <i className="fa-solid fa-heart"></i>
                }
            </button>
        <span className="badge badge-primary bg-danger mx-1">{post.TotalLikes}</span>
                </span>
        </div>
    </div>
  );
};

export default PostCard;