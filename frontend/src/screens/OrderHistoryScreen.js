import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { MdInfo } from 'react-icons/md';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { Link } from 'react-router-dom';
import { getError } from '../utils';

const BASE_URL = 'https://backend-3s5c.onrender.com';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function OrderHistoryScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    orders: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });

        const { data } = await axios.get(
          `${BASE_URL}/api/orders/mine`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchData();
  }, [userInfo]);

  // ✅ Cancel Order
  const removeProductHandler = async (orderId) => {
    if (!window.confirm("Do you want to cancel your order?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      const { data } = await axios.get(
        `${BASE_URL}/api/orders/mine`,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      console.error(getError(err));
    }
  };

  // ✅ Download Invoice PDF
  const downloadReport = async (orderId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/orders/${orderId}/report`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `OrderReport_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading report:', err);
    }
  };

  return (
    <div style={{ margin: '20px', padding: '20px', maxWidth: '900px' }}>
      <Helmet>
        <title>Order History</title>
      </Helmet>

      <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>Order History</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>DATE</th>
              <th style={tableHeaderStyle}>TOTAL</th>
              <th style={tableHeaderStyle}>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td style={tableCellStyle}>{order._id}</td>
                <td style={tableCellStyle}>{order.createdAt.substring(0, 10)}</td>
                <td style={tableCellStyle}>₹{order.totalPrice.toFixed(2)}</td>

                <td style={tableCellStyle}>
                  {/* View */}
                  <Link
                    to={`/order/${order._id}`}
                    style={{ marginRight: '10px', fontSize: '1.3rem' }}
                  >
                    <MdInfo />
                  </Link>

                  {/* Invoice */}
                  <button
                    onClick={() => downloadReport(order._id)}
                    style={buttonStyle}
                  >
                    Invoice
                  </button>

                  {/* Cancel */}
                  <button
                    onClick={() => removeProductHandler(order._id)}
                    style={cancelButton}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  padding: '12px',
  backgroundColor: '#3498db',
  color: '#fff',
};

const tableCellStyle = {
  padding: '12px',
  backgroundColor: '#ecf0f1',
};

const buttonStyle = {
  padding: '5px 10px',
  marginRight: '10px',
  backgroundColor: '#2ecc71',
  border: 'none',
  color: '#fff',
  borderRadius: '4px',
};

const cancelButton = {
  padding: '5px 10px',
  backgroundColor: '#e74c3c',
  border: 'none',
  color: '#fff',
  borderRadius: '4px',
};
