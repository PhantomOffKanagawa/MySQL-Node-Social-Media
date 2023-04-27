import "../../App.css";

const Footer = (props) => {
  const simpleIsLogged = props.simpleIsLogged;

  return (
    <header className="container d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
      <a
        href="/"
        className="d-flex align-items-center col-md-1 mb-2 mb-md-0 text-dark text-decoration-none"
      >
        <i className="fa-solid fa-database"></i>
      </a>

      {typeof simpleIsLogged != "undefined" && !simpleIsLogged && (
        <div className="col-md-3 text-end">
          <a href="/login" className="btn btn-outline-primary me-2">
            Login
          </a>
          <a href="/register" className="btn btn-primary">
            Sign-up
          </a>
        </div>
      )}
    </header>
  );
};

export default Footer;
