import axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams, Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import { toast } from "react-toastify";
import { getError } from "../utils";

// ✅ Backend URL (same everywhere)
const BASE_URL = "https://backend-3s5c.onrender.com";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "PAY_REQUEST":
      return { ...state, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "PAY_FAIL":
      return { ...state, loadingPay: false };
    case "PAY_RESET":
      return { ...state, loadingPay: false, successPay: false };

    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false, successDeliver: true };
    case "DELIVER_FAIL":
      return { ...state, loadingDeliver: false };
    case "DELIVER_RESET":
      return { ...state, loadingDeliver: false, successDeliver: false };

    default:
      return state;
  }
}

export default function OrderScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { id: orderId } = params;

  const { state } = useContext(Store);
  const { userInfo } = state;

  const [
    { loading, error, order, successPay, loadingPay, loadingDeliver, successDeliver },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
    successPay: false,
    loadingPay: false,
    loadingDeliver: false,
    successDeliver: false,
  });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  // ✅ PayPal Create Order
  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [{ amount: { value: order.totalPrice } }],
      })
      .then((orderID) => orderID);
  }

  // ✅ PayPal Approve Payment
  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: "PAY_REQUEST" });

        const { data } = await axios.put(
          `${BASE_URL}/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );

        dispatch({ type: "PAY_SUCCESS", payload: data });
        toast.success("Order is paid");
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: "PAY_FAIL" });
      }
    });
  }

  // ✅ Fetch Order Details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });

        const { data } = await axios.get(
          `${BASE_URL}/api/orders/${orderId}`,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );

        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (!userInfo) return navigate("/signin");

    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) dispatch({ type: "PAY_RESET" });
      if (successDeliver) dispatch({ type: "DELIVER_RESET" });
    } else {
      const loadPayPal = async () => {
        const { data: clientId } = await axios.get(
          `${BASE_URL}/api/keys/paypal`,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );

        paypalDispatch({
          type: "resetOptions",
          value: { "client-id": clientId, currency: "USD" },
        });

        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };
      loadPayPal();
    }
  }, [
    userInfo,
    order,
    orderId,
    navigate,
    successPay,
    successDeliver,
    paypalDispatch,
  ]);

  // ✅ Deliver Order (Admin)
  const deliverOrderHandler = async () => {
    try {
      dispatch({ type: "DELIVER_REQUEST" });

      const { data } = await axios.put(
        `${BASE_URL}/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({ type: "DELIVER_SUCCESS", payload: data });
      toast.success("Order marked as delivered ✅");
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "DELIVER_FAIL" });
    }
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>

      <h1 className="my-3">Order {orderId}</h1>

      <Row>
        <Col md={12}>
          {/* ✅ Shipping */}
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                <strong>Address:</strong>{" "}
                {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </Card.Text>
            </Card.Body>
          </Card>

          {/* ✅ Items */}
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>

              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        />{" "}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>{item.quantity}</Col>
                      <Col md={3}>₹{item.price.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ✅ PayPal Button */}
      {!order.isPaid && paymentSection()}

      {/* ✅ Deliver Button for Admin */}
      {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
        <Card>
          <Card.Body>
            {loadingDeliver ? (
              <LoadingBox />
            ) : (
              <Button onClick={deliverOrderHandler}>Mark as Delivered</Button>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );

  function paymentSection() {
    return (
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Payment</Card.Title>

          {isPending ? <LoadingBox /> : <PayPalButtons createOrder={createOrder} onApprove={onApprove} />}

          {loadingPay && <LoadingBox />}
        </Card.Body>
      </Card>
    );
  }
}
