import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetch("/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const addToCart = () => {
    setCartCount((count) => count + 1);
  };

  return (
    <div className="app">

      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">🛒</span>
          <span>Cloud<span>Cart</span></span>
        </div>

        <nav>
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#about">About</a>
        </nav>

        <button className="cart-button">
          🛍️ Cart
          <span className="cart-count">{cartCount}</span>
        </button>
      </header>

      {/* Hero */}
      <main>

        <section className="hero" id="home">
          <div className="hero-content">

            <div className="badge">
              ⚡ Cloud-Native Shopping
            </div>

            <h1>
              Shop smarter.
              <br />
              <span>Live better.</span>
            </h1>

            <p>
              Discover premium products at amazing prices,
              powered by our cloud-native e-commerce platform.
            </p>

            <a href="#products" className="shop-button">
              Explore Products →
            </a>

            <div className="hero-stats">
              <div>
                <strong>10K+</strong>
                <small>Happy Customers</small>
              </div>

              <div>
                <strong>500+</strong>
                <small>Products</small>
              </div>

              <div>
                <strong>24/7</strong>
                <small>Support</small>
              </div>
            </div>

          </div>

          <div className="hero-visual">
            <div className="glow"></div>

            <div className="floating-card card-one">
              💻
              <div>
                <strong>Technology</strong>
                <small>Latest gadgets</small>
              </div>
            </div>

            <div className="floating-card card-two">
              🎧
              <div>
                <strong>Premium</strong>
                <small>Quality products</small>
              </div>
            </div>

            <div className="shopping-bag">
              🛍️
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="products-section" id="products">

          <div className="section-heading">
            <div>
              <span>OUR COLLECTION</span>
              <h2>Featured Products</h2>
            </div>

            <p>
              Hand-picked products for your everyday needs.
            </p>
          </div>

          {loading && (
            <div className="message">
              Loading products...
            </div>
          )}

          {error && (
            <div className="message error">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && (
            <div className="product-grid">

              {products.map((product, index) => (

                <div className="product-card" key={product.id}>

                  <div className={`product-image image-${index % 3}`}>
                    {index === 0 && "💻"}
                    {index === 1 && "🖱️"}
                    {index === 2 && "⌨️"}

                    <span className="sale-badge">
                      HOT
                    </span>
                  </div>

                  <div className="product-info">

                    <span className="category">
                      {index === 0
                        ? "Electronics"
                        : index === 1
                        ? "Accessories"
                        : "Computer"}
                    </span>

                    <h3>{product.name}</h3>

                    <div className="rating">
                      ⭐⭐⭐⭐⭐
                      <span>(4.8)</span>
                    </div>

                    <div className="product-bottom">

                      <div>
                        <small>Price</small>
                        <strong>₹{product.price}</strong>
                      </div>

                      <button
                        className="add-button"
                        onClick={addToCart}
                      >
                        + Add
                      </button>

                    </div>

                    <div className="stock">
                      <span className="stock-dot"></span>
                      {product.stock} items available
                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}
        </section>

        {/* Banner */}
        <section className="promo">

          <div>
            <span>LIMITED TIME OFFER</span>
            <h2>Upgrade your setup today 🚀</h2>
            <p>
              Premium technology. Better prices. Faster shopping.
            </p>
          </div>

          <a href="#products">
            Shop Now →
          </a>

        </section>

      </main>

      {/* Footer */}
      <footer id="about">

        <div className="footer-logo">
          🛒 CloudCart
        </div>

        <p>
          Cloud-Native E-Commerce Platform
        </p>

        <div className="footer-tech">
          React • Docker • Kubernetes • AWS
        </div>

        <small>
          CloudCart © 2026. Built for the cloud.
        </small>

      </footer>

    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
