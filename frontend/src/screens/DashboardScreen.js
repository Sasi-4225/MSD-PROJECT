import React, { useContext, useEffect, useReducer } from "react";
import Chart from "react-google-charts";
import axios from "axios";
import { Store } from "../Store";
import { getError } from "../utils";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, summary: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function DashboardScreen() {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: {},
    error: "",
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });

      try {
        // ✅ ONLY USE RELATIVE URL (Base URL already set in App.js)
        const { data } = await axios.get("/api/orders/summary", {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });

        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    fetchData();
  }, [userInfo]);

  const usersCount = summary?.users?.[0]?.numUsers || 0;
  const ordersCount = summary?.orders?.[0]?.numOrders || 0;
  const totalSales = summary?.orders?.[0]?.totalSales || 0;

  return (
    <div>
      <h1>Dashboard</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          {/* Summary Cards */}
          <Row>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>{usersCount}</Card.Title>
                  <Card.Text>Users</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>{ordersCount}</Card.Title>
                  <Card.Text>Total Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>₹{totalSales.toFixed(2)}</Card.Title>
                  <Card.Text>Total Sales</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Sales Chart */}
          <div className="my-3">
            <h2>Sales</h2>
            {!summary?.dailyOrders?.length ? (
              <MessageBox>No Sales Data</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="AreaChart"
                loader={<div>Loading chart...</div>}
                data={[
                  ["Date", "Sales"],
                  ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                ]}
              />
            )}
          </div>

          {/* Categories Chart */}
          <div className="my-3">
            <h2>Product Categories</h2>
            {!summary?.productCategories?.length ? (
              <MessageBox>No Category Data</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="PieChart"
                loader={<div>Loading chart...</div>}
                data={[
                  ["Category", "Products"],
                  ...summary.productCategories.map((x) => [x._id, x.count]),
                ]}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
