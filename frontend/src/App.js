import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';

import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';

import { LinkContainer } from 'react-router-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { Store } from './Store';

import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

import axios from 'axios';
import { getError } from './utils';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import DashboardScreen from './screens/DashboardScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';

import MapScreen from './screens/MapScreen';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

import Aboutus from './screens/Aboutus';
import Feedback from './screens/Feedback';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';

// ✅ GLOBAL API URL (Do NOT change)
axios.defaults.baseURL = 'https://backend-3s5c.onrender.com';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart, userInfo } = state;

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    ctxDispatch({ type: 'CART_RESET' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };

  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/products/categories');
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  return (
    <BrowserRouter>
      <div
        style={{
          backgroundColor: '#90EE90',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        className={
          sidebarIsOpen
            ? fullBox
              ? 'site-container active-cont d-flex flex-column full-box'
              : 'site-container active-cont d-flex flex-column'
            : fullBox
            ? 'site-container d-flex flex-column full-box'
            : 'site-container d-flex flex-column'
        }
      >
        <ToastContainer position="bottom-center" limit={1} />

        {/* ✅ HEADER */}
        <header>
          <Navbar style={{ backgroundColor: '#004225' }} variant="dark" expand="lg">
            <Container>
              <LinkContainer to="/">
                <Navbar.Brand>
                  <img
                    src="/images/logo.png"
                    alt="logo"
                    style={{ width: '100px', height: 'auto' }}
                  />
                </Navbar.Brand>
              </LinkContainer>

              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <SearchBox />

                <Nav className="me-auto w-100 justify-content-end">

                  {/* ✅ ADMIN MENU */}
                  {userInfo && userInfo.isAdmin && (
                    <>
                      <LinkContainer to="/admin/dashboard">
                        <Nav.Link style={{ color: '#fff' }}>Dashboard</Nav.Link>
                      </LinkContainer>

                      <LinkContainer to="/admin/products">
                        <Nav.Link style={{ color: '#fff' }}>Medicine</Nav.Link>
                      </LinkContainer>

                      <LinkContainer to="/admin/orders">
                        <Nav.Link style={{ color: '#fff' }}>Orders</Nav.Link>
                      </LinkContainer>

                      <LinkContainer to="/admin/users">
                        <Nav.Link style={{ color: '#fff' }}>Users</Nav.Link>
                      </LinkContainer>
                    </>
                  )}

                  {/* ✅ CART */}
                  <Link to="/cart" className="nav-link">
                    <FontAwesomeIcon icon={faShoppingCart} style={{ color: '#fff' }} />
                    {cart.cartItems.length > 0 && (
                      <Badge pill bg="danger">
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>

                  {/* ✅ USER MENU */}
                  {userInfo ? (
                    <NavDropdown
                      title={<FontAwesomeIcon icon={faUser} style={{ color: '#fff' }} />}
                      id="user-nav-dropdown"
                    >
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/orderhistory">
                        <NavDropdown.Item>Order History</NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/aboutus">
                        <NavDropdown.Item>About Us</NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/feedback">
                        <NavDropdown.Item>Contact Us</NavDropdown.Item>
                      </LinkContainer>

                      <NavDropdown.Divider />

                      <NavDropdown.Item onClick={signoutHandler}>
                        Sign Out
                      </NavDropdown.Item>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/signin" style={{ color: '#fff' }}>
                      Sign In
                    </Link>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>

        {/* ✅ SIDEBAR */}
        <div
          className={
            sidebarIsOpen
              ? 'active-nav side-navbar d-flex flex-column'
              : 'side-navbar d-flex flex-column'
          }
        >
          <Nav className="flex-column p-2">
            <strong>Categories</strong>
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer
                  to={{ pathname: '/search', search: `category=${category}` }}
                  onClick={() => setSidebarIsOpen(false)}
                >
                  <Nav.Link>{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
          </Nav>
        </div>

        {/* ✅ MAIN CONTENT */}
        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/search" element={<SearchScreen />} />

              {/* Auth */}
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/forget-password" element={<ForgetPasswordScreen />} />
              <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />

              {/* Info pages */}
              <Route path="/aboutus" element={<Aboutus />} />
              <Route path="/feedback" element={<Feedback />} />

              {/* Protected */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />

              <Route path="/shipping" element={<ShippingAddressScreen />} />
              <Route path="/payment" element={<PaymentMethodScreen />} />
              <Route path="/placeorder" element={<PlaceOrderScreen />} />

              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orderhistory"
                element={
                  <ProtectedRoute>
                    <OrderHistoryScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <MapScreen />
                  </ProtectedRoute>
                }
              />

              {/* ADMIN ROUTES */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardScreen />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <ProductListScreen />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/product/:id"
                element={
                  <AdminRoute>
                    <ProductEditScreen />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <OrderListScreen />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserListScreen />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/user/:id"
                element={
                  <AdminRoute>
                    <UserEditScreen />
                  </AdminRoute>
                }
              />
            </Routes>
          </Container>
        </main>

        {/* ✅ FOOTER */}
        <footer>
          <div className="text-center">All rights reserved</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
