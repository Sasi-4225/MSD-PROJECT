import React, { useEffect, useReducer } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getError, BASE_URL } from "../utils";   // ✅ IMPORT BASE_URL
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
        loading: false,
        products: action.payload.products,
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
  const category = sp.get("category") || "";

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    products: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });

        let url = `${BASE_URL}/api/products/search?`;

        if (query !== "all") url += `query=${query}`;
        if (category) url += `&category=${category}`;

        // ✅ MAIN API CALL
        let { data } = await axios.get(url);

        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(err),
        });
      }
    };

    fetchData();
  }, [query, category]);

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
                      <p>No results found.</p>
                    ) : (
                      <>
                        <strong>{products.length}</strong> Results{" "}
                        {query !== "all" && `for "${query}"`}

                        {(query !== "all" || category) && (
                          <Button
                            variant="light"
                            onClick={() => navigate("/search")}
                            className="ms-2"
                          >
                            <i className="fas fa-times-circle"></i>
                          </Button>
                        )}
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
