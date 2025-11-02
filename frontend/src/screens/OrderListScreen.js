import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { FaTrashAlt, FaEye } from 'react-icons/fa';

const BASE_URL = 'https://backend-3s5c.onrender.com';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, orders: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      return state;
  }
};

export default function OrderListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      orders: [],
      error: '',
    });

  // ✅ Only admins can access this page
  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/signin');
    }
  }, [userInfo, navigate]);

  // ✅ Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });

        const { data } = await axios.get(`${BASE_URL}/api/orders`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    }

    fetchOrders();
  }, [userInfo, successDelete]);

  // ✅ Delete order
  const deleteHandler = async (order) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      dispatch({ type: 'DELETE_REQUEST' });

      await axios.delete(`${BASE_URL}/api/orders/${order._id}`, {
        headers: { authorization: `Bearer ${userInfo.token}` },
      });

      toast.success('Order deleted successfully');
      dispatch({ type: 'DELETE_SUCCESS' });
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'DELETE_FAIL' });
    }
  };

  return (
    <div>
      <Helmet>
        <title>Orders</title>
      </Helmet>

      <h1>Orders</h1>

      {loadingDelete && <LoadingBox />}

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>₹{order.totalPrice.toFixed(2)}</td>

                <td>
                  {/* View Button */}
                  <Button
                    type="button"
                    variant="light"
                    title="View Order"
                    onClick={() => navigate(`/order/${order._id}`)}
                  >
                    <FaEye />
                  </Button>

                  &nbsp;

                  {/* Delete Button */}
                  <Button
                    type="button"
                    variant="danger"
                    title="Delete Order"
                    onClick={() => deleteHandler(order)}
                  >
                    <FaTrashAlt />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
