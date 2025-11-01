import Axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { state } = useContext(Store);
  const { userInfo } = state;

  // ✅ If user already logged in OR no token → do not allow reset page
  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
    if (!token) {
      toast.error('Invalid or expired password reset link');
      navigate('/');
    }
  }, [navigate, userInfo, token]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await Axios.post('/api/users/reset-password', {
        token,
        password,
      });

      toast.success('Password updated successfully');
      navigate('/signin');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Reset Password</title>
      </Helmet>
      <h1 className="my-3">Reset Password</h1>

      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
          />
        </Form.Group>

        <div className="mb-3">
          <Button type="submit">Reset Password</Button>
        </div>
      </Form>
    </Container>
  );
}
