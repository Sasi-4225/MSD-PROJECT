import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import ReCAPTCHA from 'react-google-recaptcha';

export default function ForgetPasswordScreen() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [recaptchaValue, setRecaptchaValue] = useState('');

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!recaptchaValue) {
      toast.error('Please complete the reCAPTCHA verification');
      return;
    }

    try {
      const { data } = await axios.post(
        'https://backend-3s5c.onrender.com/api/users/forget-password',
        {
          email,
          recaptchaValue,
        }
      );

      toast.success(data.message || 'Reset link sent to email');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Something went wrong. Try again.'
      );
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Forget Password</title>
      </Helmet>

      <h1 className="my-3">Forget Password</h1>

      <Form onSubmit={submitHandler}>
        {/* Email */}
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            required
            placeholder="Enter your registered email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        {/* reCAPTCHA */}
        <Form.Group className="mb-3">
          <ReCAPTCHA
            sitekey="6Lf7eyQpAAAAABP44pO0L6bvtrOV5FnLLk1kGIrR"
            onChange={(value) => setRecaptchaValue(value)}
          />
        </Form.Group>

        <div className="mb-3">
          <Button type="submit" className="w-100">
            Submit
          </Button>
        </div>
      </Form>
    </Container>
  );
}
