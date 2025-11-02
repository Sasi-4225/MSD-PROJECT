import React, { useContext, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';

// Reducer
const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      dispatch({ type: 'UPDATE_REQUEST' });

      const { data } = await axios.put(
        'https://backend-3s5c.onrender.com/api/users/profile',
        { name, email, password },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      dispatch({ type: 'UPDATE_SUCCESS' });

      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));

      toast.success('Profile Updated Successfully ✅');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <div style={containerStyle}>
      <Helmet>
        <title>User Profile</title>
      </Helmet>

      <div style={boxContainerStyle}>
        <h1 style={headingStyle}>User Profile</h1>

        <form onSubmit={submitHandler} style={formStyle}>
          <Form.Group controlId="name" style={formGroupStyle}>
            <Form.Label style={labelStyle}>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </Form.Group>

          <Form.Group controlId="email" style={formGroupStyle}>
            <Form.Label style={labelStyle}>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </Form.Group>

          <Form.Group controlId="password" style={formGroupStyle}>
            <Form.Label style={labelStyle}>Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep existing"
              style={inputStyle}
            />
          </Form.Group>

          <Form.Group controlId="confirmPassword" style={formGroupStyle}>
            <Form.Label style={labelStyle}>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          </Form.Group>

          <div style={buttonContainerStyle}>
            <Button type="submit" style={buttonStyle} disabled={loadingUpdate}>
              {loadingUpdate ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ✅ STYLES FIXED BELOW */
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: '40px 20px',
};

const boxContainerStyle = {
  background: 'white',
  padding: '25px',
  width: '100%',
  maxWidth: '500px',
  borderRadius: '10px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
};

const headingStyle = {
  textAlign: 'center',
  fontWeight: 'bold',
  marginBottom: '20px',
};

const formStyle = { width: '100%' };

const formGroupStyle = { marginBottom: '15px' };

const labelStyle = {
  fontWeight: 'bold',
};

const inputStyle = {
  borderRadius: '5px',
  padding: '10px',
};

const buttonContainerStyle = {
  textAlign: 'center',
  marginTop: '20px',
};

const buttonStyle = {
  backgroundColor: '#0066cc',
  border: 'none',
  padding: '10px 20px',
  fontWeight: 'bold',
  borderRadius: '5px',
};
