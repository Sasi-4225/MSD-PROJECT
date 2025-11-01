import React, { useEffect, useReducer } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getError } from "../utils";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Button from "react-bootstrap/Button";
import { Row, Col } from "react-bootstrap";
import Product from "../components/Product";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        products: action.payload.products,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default function SearchScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);

  const query = sp.get("query") || "all";

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    products: [],
  });

  // ✅ FETCH PRODUCTS (supports product search + category fallback)
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });

        // Search by product name
        let productResponse = await axios.get(
          `/api/products/search?query=${query}`
        );

        let productData = productResponse.data;

        // If NO product found → search by category
        if (productData.products.length === 0) {
          let categoryResponse = await axios.get(
            `/api/products/search?category=${query}`
          );
          productData = categoryResponse.data;
        }

        dispatch({ type: "FETCH_SUCCESS", payload: productData });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    fetchData();
  }, [query]);

  return (
    <div>
      <Helmet>
        <title>Search Medicines</title>
      </Helmet>

      <Row>
        <Col md={12}>
          {loading ? (
            <LoadingBox />
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <Row className="justify-content-between mb-3">
                <Col md={10}>
                  <div>
                    {products.length === 0 ? (
                      <p>No results found, showing alternative medicines...</p>
                    ) : (
                      <>
                        <strong>{products.length}</strong> Results
                        {query !== "all" && ` : ${query}`}

                        <Button
                          variant="light"
                          onClick={() => navigate("/search")}
                          className="ms-2"
                        >
                          <i className="fas fa-times-circle"></i>
                        </Button>
                      </>
                    )}
                  </div>
                </Col>
              </Row>

              <Row>
                {products.map((product) => (
                  <Col sm={6} lg={4} className="mb-3" key={product._id}>
                    <Product product={product} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}
