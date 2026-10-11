import { useEffect, useMemo, useState } from "react";

const API_URL = "https://fakestoreapi.com/products";

function readSavedData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function money(value) {
  return `$${Number(value).toFixed(2)}`;
}

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("featured");
  const [activePage, setActivePage] = useState("shop");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(() => readSavedData("shopjoy-cart", []));
  const [wishlist, setWishlist] = useState(() => readSavedData("shopjoy-wishlist", []));
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    let ignore = false;

    async function getProducts() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("The product service did not respond. Please try again.");
        }
        const data = await response.json();
        if (!ignore) setProducts(data);
      } catch {
        if (!ignore) {
          setError("We couldn't load products. Check your internet connection and try again.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    getProducts();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("shopjoy-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("shopjoy-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const categories = useMemo(
    () => ["all", ...new Set(products.map((product) => product.category))],
    [products]
  );

  const visibleProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || product.category === category;
      const matchesMin = minPrice === "" || product.price >= Number(minPrice);
      const matchesMax = maxPrice === "" || product.price <= Number(maxPrice);
      const matchesWishlist =
        activePage !== "wishlist" || wishlist.includes(product.id);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMin &&
        matchesMax &&
        matchesWishlist
      );
    });

    if (sort === "low") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "high") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "rating") {
      result = [...result].sort(
        (a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0)
      );
    }
    return result;
  }, [products, search, category, minPrice, maxPrice, sort, activePage, wishlist]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setOrderMessage("");
    setCartOpen(true);
  }

  function changeQuantity(productId, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId) {
    setCart((current) => current.filter((item) => item.id !== productId));
  }

  function toggleWishlist(productId) {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  }

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("featured");
  }

  function openShop() {
    setActivePage("shop");
    setOrderMessage("");
  }

  function submitCheckout(event) {
    event.preventDefault();
    if (cart.length === 0) return;

    // Demo checkout only: no real payment is collected.
    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    setOrderMessage(
      `Thank you, ${customer.name}! Your demo order #${orderNumber} has been placed.`
    );
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    setCustomer({ name: "", email: "", address: "", city: "" });
    setActivePage("shop");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <div className="announcement">
        <span>✨ A little joy in every order</span>
        <span className="announcement-right">Fresh finds · Happy prices · ShopJoy</span>
      </div>

      <header className="site-header">
        <button className="brand" onClick={openShop} aria-label="ShopJoy home">
          <span className="brand-mark">S</span>
          <span>shop<span className="brand-color">joy</span><small>GOOD FINDS, GOOD VIBES</small></span>
        </button>

        <label className="header-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setActivePage("shop");
            }}
            placeholder="Search for something lovely..."
            aria-label="Search products"
          />
          <kbd>SEARCH</kbd>
        </label>

        <div className="header-actions">
          <button
            className={`header-link ${activePage === "wishlist" ? "active" : ""}`}
            onClick={() => setActivePage("wishlist")}
          >
            <span className="action-icon">♡</span><span>Wishlist</span>
            <b className="tiny-count">{wishlist.length}</b>
          </button>
          <button className="cart-button" onClick={() => setCartOpen(true)}>
            <span>🛍</span> Cart <b>{cartCount}</b>
          </button>
        </div>
      </header>

      <nav className="main-nav" aria-label="Main navigation">
        <button className={activePage === "shop" ? "nav-active" : ""} onClick={openShop}>Home</button>
        <button onClick={() => { setCategory("all"); setActivePage("shop"); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}>Shop all</button>
        <button onClick={() => { setCategory("women's clothing"); setActivePage("shop"); }}>Fashion</button>
        <button onClick={() => { setCategory("electronics"); setActivePage("shop"); }}>Electronics</button>
        <button onClick={() => { setCategory("jewelery"); setActivePage("shop"); }}>Jewelry</button>
        <span className="nav-note">Little treats, big smiles <span>♡</span></span>
      </nav>

      <main>
        {activePage === "shop" && (
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow"><span className="eyebrow-dot" /> YOUR HAPPY PLACE TO SHOP</span>
              <h1>Find your next<br /><span>little happy.</span></h1>
              <p>Everyday favourites, delightful discoveries, and feel-good finds — all in one colourful place.</p>
              <button className="primary-button" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>
                Explore the collection <span>→</span>
              </button>
              <div className="hero-trust">
                <span>♡ Thoughtful finds</span><span>✦ Easy browsing</span><span>✓ Happy shopping</span>
              </div>
            </div>
            <div className="hero-art" aria-label="Shopping illustration">
              <div className="sun-shape" />
              <div className="hero-spark spark-one">✦</div>
              <div className="hero-spark spark-two">✧</div>
              <div className="floating-note note-one">good things<br />inside ♡</div>
              <div className="shopping-bag">
                <div className="bag-handle" />
                <div className="bag-face">S<span>J</span></div>
                <div className="bag-sticker">♥</div>
              </div>
              <div className="floating-note note-two">made for<br />your day!</div>
              <div className="hero-orbit orbit-one" />
              <div className="hero-orbit orbit-two" />
            </div>
            <div className="hero-bottom-tag">A LITTLE COLOUR. A LOT OF JOY.</div>
          </section>
        )}

        {orderMessage && (
          <div className="success-message" role="status">
            <span>✓</span> {orderMessage}
            <button onClick={() => setOrderMessage("")} aria-label="Dismiss message">×</button>
          </div>
        )}

        <section className="benefits">
          <div><span className="benefit-icon peach">✦</span><span><b>Lovely finds</b><small>Something for everyone</small></span></div>
          <div><span className="benefit-icon lavender">♡</span><span><b>Made easy</b><small>Simple, joyful browsing</small></span></div>
          <div><span className="benefit-icon mint">↗</span><span><b>Find your vibe</b><small>Explore every category</small></span></div>
          <div><span className="benefit-icon yellow">☻</span><span><b>Happy cart</b><small>Your picks in one place</small></span></div>
        </section>

        <section className="catalog-section" id="products">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE GOOD STUFF</span>
              <h2>{activePage === "wishlist" ? "Your lovely list" : "A little something for you"}<span className="heading-dot">.</span></h2>
              <p>{activePage === "wishlist" ? "All your saved favourites, together." : "Scroll, discover, and fall for something new."}</p>
            </div>
            <div className="catalog-label"><span className="live-dot" /> {visibleProducts.length} FINDS TO EXPLORE</div>
          </div>

          <div className="shop-layout">
            <aside className="filters">
              <div className="filter-title"><h3>Filters</h3><button onClick={resetFilters}>Reset</button></div>

              <div className="filter-group">
                <h4>Categories</h4>
                {categories.map((item) => (
                  <button
                    key={item}
                    className={`category-option ${category === item ? "selected" : ""}`}
                    onClick={() => { setCategory(item); setActivePage("shop"); }}
                  >
                    <span>{item === "all" ? "✿" : item === "electronics" ? "⌘" : item === "jewelery" ? "◇" : "♡"}</span>
                    <span>{item === "all" ? "All products" : item}</span>
                    {category === item && <b>✓</b>}
                  </button>
                ))}
              </div>

              <div className="filter-group price-filter">
                <h4>Price range</h4>
                <div className="price-inputs">
                  <label><span>MIN ($)</span><input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="0" /></label>
                  <label><span>MAX ($)</span><input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="999" /></label>
                </div>
                <p>Choose a budget that feels right.</p>
              </div>

              <div className="filter-promo">
                <span>✧ A GOOD FIND</span>
                <p>Great things are just a click away.</p>
                <div className="promo-doodle">♡</div>
              </div>
            </aside>

            <div className="product-area">
              <div className="product-toolbar">
                <span>Showing <b>{visibleProducts.length}</b> products</span>
                <label className="sort-select">Sort by
                  <select value={sort} onChange={(event) => setSort(event.target.value)}>
                    <option value="featured">Featured</option>
                    <option value="low">Price: low to high</option>
                    <option value="high">Price: high to low</option>
                    <option value="rating">Top rated</option>
                  </select>
                </label>
              </div>

              {loading && <div className="state-box"><div className="loader" /><h3>Finding lovely things...</h3><p>Loading products from the store API.</p></div>}
              {error && <div className="state-box error-box"><span>☹</span><h3>Oops, a little hiccup!</h3><p>{error}</p><button className="primary-button" onClick={() => window.location.reload()}>Try again</button></div>}

              {!loading && !error && visibleProducts.length === 0 && (
                <div className="state-box"><span>♡</span><h3>No products found</h3><p>Try another search or reset your filters.</p><button className="secondary-button" onClick={resetFilters}>Clear filters</button></div>
              )}

              {!loading && !error && visibleProducts.length > 0 && (
                <div className="product-grid">
                  {visibleProducts.map((product, index) => (
                    <article className="product-card" key={product.id}>
                      <div className={`product-image-wrap tone-${index % 5}`}>
                        <button
                          className={`wishlist-button ${wishlist.includes(product.id) ? "wishlisted" : ""}`}
                          onClick={() => toggleWishlist(product.id)}
                          aria-label={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                        >{wishlist.includes(product.id) ? "♥" : "♡"}</button>
                        <button className="image-button" onClick={() => setSelectedProduct(product)} aria-label={`View ${product.title}`}>
                          <img src={product.image} alt={product.title} loading="lazy" />
                        </button>
                        {index < 3 && <span className="product-badge">{["GOOD FIND", "POPULAR", "JUST CUTE"][index]}</span>}
                      </div>
                      <div className="product-info">
                        <span className="product-category">{product.category}</span>
                        <button className="product-name" onClick={() => setSelectedProduct(product)}>{product.title}</button>
                        <div className="rating-line"><span>★</span> {product.rating?.rate ?? "—"} <small>({product.rating?.count ?? 0} reviews)</small></div>
                        <div className="product-bottom">
                          <strong>{money(product.price)}</strong>
                          <button className="add-button" onClick={() => addToCart(product)} aria-label={`Add ${product.title} to cart`}>+</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="newsletter">
          <div className="newsletter-spark">✦</div>
          <div><span className="eyebrow">A LITTLE NOTE FROM US</span><h2>Good things look good on you.</h2><p>Keep exploring. Your next favourite might be right here.</p></div>
          <button className="newsletter-button" onClick={() => { openShop(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to the top ↑</button>
        </section>
      </main>

      <footer className="site-footer">
        <button className="brand footer-brand" onClick={openShop}><span className="brand-mark">S</span><span>shop<span className="brand-color">joy</span><small>GOOD FINDS, GOOD VIBES</small></span></button>
        <p>A colourful little demo store built with React and an API.</p>
        <span>Made with <b>♡</b> for learning</span>
      </footer>

      {selectedProduct && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
          <section className="details-modal" role="dialog" aria-modal="true" aria-label="Product details">
            <button className="close-button" onClick={() => setSelectedProduct(null)} aria-label="Close details">×</button>
            <div className="details-image"><img src={selectedProduct.image} alt={selectedProduct.title} /></div>
            <div className="details-copy">
              <span className="eyebrow">{selectedProduct.category}</span>
              <h2>{selectedProduct.title}</h2>
              <div className="details-rating"><span>★</span> {selectedProduct.rating?.rate ?? "—"} / 5 <small>({selectedProduct.rating?.count ?? 0} reviews)</small></div>
              <strong className="details-price">{money(selectedProduct.price)}</strong>
              <p>{selectedProduct.description}</p>
              <div className="details-actions">
                <button className="primary-button" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>Add to cart <span>→</span></button>
                <button className={`detail-heart ${wishlist.includes(selectedProduct.id) ? "wishlisted" : ""}`} onClick={() => toggleWishlist(selectedProduct.id)}>{wishlist.includes(selectedProduct.id) ? "♥ Saved" : "♡ Wishlist"}</button>
              </div>
              <small className="demo-note">Demo product data provided by Fake Store API.</small>
            </div>
          </section>
        </div>
      )}

      {cartOpen && (
        <div className="overlay drawer-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
            <div className="drawer-header"><div><span className="eyebrow">YOUR HAPPY PICKS</span><h2>Your cart <span>({cartCount})</span></h2></div><button className="close-button" onClick={() => setCartOpen(false)} aria-label="Close cart">×</button></div>
            {cart.length === 0 ? (
              <div className="empty-cart"><span>🛍️</span><h3>Your cart is waiting for joy!</h3><p>Add something lovely and it will show up here.</p><button className="primary-button" onClick={() => setCartOpen(false)}>Keep exploring</button></div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-image"><img src={item.image} alt={item.title} /></div>
                      <div className="cart-item-info"><h3>{item.title}</h3><strong>{money(item.price)}</strong><div className="quantity-control"><button onClick={() => changeQuantity(item.id, -1)} aria-label="Decrease quantity">−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label="Increase quantity">+</button></div></div>
                      <button className="remove-item" onClick={() => removeFromCart(item.id)} aria-label="Remove item">×</button>
                    </div>
                  ))}
                </div>
                <div className="cart-summary"><div><span>Subtotal</span><b>{money(cartTotal)}</b></div><div><span>Delivery</span><b className="free-label">Demo only</b></div><div className="cart-total"><span>Total</span><strong>{money(cartTotal)}</strong></div><p>Checkout is a demo. No real payment will be taken.</p><button className="primary-button checkout-button" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Continue to checkout <span>→</span></button><button className="continue-shopping" onClick={() => setCartOpen(false)}>← Continue shopping</button></div>
              </>
            )}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCheckoutOpen(false); }}>
          <section className="checkout-modal" role="dialog" aria-modal="true" aria-label="Checkout form">
            <div className="drawer-header"><div><span className="eyebrow">ALMOST YOURS</span><h2>Checkout <span>♡</span></h2></div><button className="close-button" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout">×</button></div>
            <div className="checkout-order"><span>{cartCount} item(s) in your happy cart</span><strong>{money(cartTotal)}</strong></div>
            <form onSubmit={submitCheckout} className="checkout-form">
              <label>Full name<input required value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Your name" /></label>
              <label>Email address<input type="email" required value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} placeholder="you@example.com" /></label>
              <label>Delivery address<textarea required value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Street, area, house number" rows="3" /></label>
              <label>City<input required value={customer.city} onChange={(event) => setCustomer({ ...customer, city: event.target.value })} placeholder="Your city" /></label>
              <div className="demo-warning">This is a learning project. Do not enter payment-card details. Submitting creates a local demo confirmation only.</div>
              <button className="primary-button checkout-button" type="submit">Place demo order · {money(cartTotal)} <span>→</span></button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
