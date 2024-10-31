import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, Link } from 'react-router-dom';
import { Signout } from '../../actions';

function Header() {

  const auth = useSelector(state=>state.auth);
  const dispatch = useDispatch();
  const logout = ()=>{
    dispatch(Signout());
  }
  const nonloggedin = () => {
    return (
      <Nav>
        <li className='nav-item' >
          <NavLink to='/Signin' className='nav-link'>Signin</NavLink>
        </li>
        <li className='nav-item' >
          <NavLink to='/Signup' className='nav-link'>Signup</NavLink>
        </li>
      </Nav>
    )
  }
  const loggedin = ()=>{
    return (
      <Nav>
        <li className='nav-item' >
          <span className='nav-link' onClick={logout}>Sign Out</span>
        </li>
      </Nav>
    )
  }



  return (
    <Navbar collapseOnSelect expand="lg" className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ zIndex: 1 }}>
      <Container fluid>
        <Navbar.Brand href='/'>Welcome Back</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {/* <NavDropdown title="Dropdown" id="collapsible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown> */}
          </Nav>
          {auth.authenticate ? loggedin() : nonloggedin()}

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
