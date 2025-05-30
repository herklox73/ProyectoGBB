import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

const NavBar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="fas fa-paw me-2"></i> Adopción de Mascotas
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {user ? (
              <>
                <Nav.Link as={Link} to="/mascotas" className="me-3">
                  <i className="fas fa-dog me-1"></i> Mascotas
                </Nav.Link>
                <Nav.Link as={Link} to="/solicitudes" className="me-3">
                  <i className="fas fa-file-alt me-1"></i> Solicitudes
                </Nav.Link>
                <Nav.Link as={Link} to="/perfil" className="me-3">
                  <i className="fas fa-user me-1"></i> Perfil
                </Nav.Link>
                {user.rol === "Administrador" && (
                  <Nav.Link as={Link} to="/admin" className="me-3">
                    <i className="fas fa-user-shield me-1"></i> Admin
                  </Nav.Link>
                )}
                <NavDropdown
                  title={
                    <span>
                      <i className="fas fa-user me-1"></i> {user.email}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-1"></i> Salir
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/" className="me-3">
                  <i className="fas fa-sign-in-alt me-1"></i> Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="me-3">
                  <i className="fas fa-user-plus me-1"></i> Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
