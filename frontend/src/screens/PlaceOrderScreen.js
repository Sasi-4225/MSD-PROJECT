import Axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import { toast } from "react-toastify";
import { getError } from "../utils";
import { Store } from "../Store";
import CheckoutSteps from "../components/CheckoutSteps";
import LoadingBox from "../components/LoadingBox";

const BASE_URL = "https://backend-3s5c.onrender.com";

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  // ✅ Prepare shipping object to avoid undefined errors
  const shippingAddress = {
    fullName: cart.shippingAddress.fullName || "",
    address: cart.shippingAddress.address || "",
    city: cart.shippingAddress.city || "",
    postalCode: cart.shippingAddress.postalCode || "",
    country: cart.shippingAddress.country || "",
  };

  // ✅ Price Calculations
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 100 ? 0 : 10;
  cart.DiscountPrice = round2(0.1 * cart.itemsPrice);
  cart.totalPrice =
    cart.itemsPrice + cart.shippingPrice - cart.DiscountPrice;

  // ✅ Place Order Handler
  const placeOrderHandler = async () => {
    try {
      dispatch({ type: "CREATE_REQUEST" });

      const { data } = await Axios.post(
        `${BASE_URL}/api/orders`,
        {
          orderItems: cart.cartItems,
          shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          DiscountPrice: cart.DiscountPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      ctxDispatch({ type: "CART_CLEAR" });
      dispatch({ type: "CREATE_SUCCESS" });
      localStorage.removeItem("cartItems");

      // ✅ Success message
      toast.success("Order placed successfully!");

      // ✅ Redirect to ORDER DETAILS page
      navigate(`/order/${data.order._id}`);

    } catch (err) {
      dispatch({ type: "CREATE_FAIL" });
      toast.error(getError(err));
    }
  };

  // ✅ Prevent access without payment method
  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate("/payment");
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4 />
      <Helmet>
        <title>Preview Order</title>
      </Helmet>

      <h1 className="my-3">Preview Order</h1>

      <Row>
        <Card>
          <Card.Body>
            <Card.Title>Order Summary</Card.Title>
            <ListGroup variant="flush">

              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>₹{cart.itemsPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Delivery Charges</Col>
                  <Col>₹{cart.shippingPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Discount (10%)</Col>
                  <Col>-₹{cart.DiscountPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col><strong>Order Total</strong></Col>
                  <Col><strong>₹{cart.totalPrice.toFixed(2)}</strong></Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <div className="d-grid">
                  <Button
                    type="button"
                    onClick={placeOrderHandler}
                    disabled={cart.cartItems.length === 0}
                  >
                    Place Order
                  </Button>
                </div>
                {loading && <LoadingBox />}
              </ListGroup.Item>

            </ListGroup>
          </Card.Body>
        </Card>
      </Row>
    </div>
  );
}
