import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import CheckoutSteps from "../components/CheckoutSteps";
import { Store } from "../Store";

export default function PaymentMethodScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);

  const {
    cart: { shippingAddress, paymentMethod },
  } = state;

  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || "online"
  );

  // ✅ Redirect if shipping address missing
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
    }
  }, [shippingAddress, navigate]);

  // ✅ Submit & save payment method
  const submitHandler = (e) => {
    e.preventDefault();

    ctxDispatch({
      type: "SAVE_PAYMENT_METHOD",
      payload: paymentMethodName,
    });

    localStorage.setItem("paymentMethod", paymentMethodName);

    navigate("/placeorder");
  };

  return (
    <div>
      <CheckoutSteps step1 step2 step3 />

      <div className="container small-container">
        <Helmet>
          <title>Payment Method</title>
        </Helmet>

        <h1 className="my-3">Payment Method</h1>

        <Form onSubmit={submitHandler}>
          <div className="mb-3">
            <Form.Check
              type="radio"
              id="online"
              label="Online Payment"
              value="online"
              checked={paymentMethodName === "online"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <Form.Check
              type="radio"
              id="cod"
              label="Cash on Delivery"
              value="cod"
              checked={paymentMethodName === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <Button type="submit" variant="primary" className="w-100">
              Continue
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
