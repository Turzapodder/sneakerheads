
import { Link } from 'react-router-dom';
import './LandingPage.css';
import heroImage from '../assets/hero-image.png';

export default function LandingPage() {
    return (
        <div className="landing-page">
            {/* Background Typography */}
            <div className="bg-text">
                <span>N</span>
                <span>I</span>
                <span>K</span>
                <span>E</span>
                <span style={{ marginLeft: '4rem' }}>S</span>
                <span>P</span>
                <span>E</span>
                <span>E</span>
                <span>D</span>
                <span>R</span>
                <span>E</span>
                <span>P</span>
            </div>

            <header>
                <div className="logo">
                    {/* Nike Swoosh SVG */}
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 8.25c-2.484-1.35-7.8-2.25-10.5-2.25-5.1 0-8.25 2.25-8.25 6 0 3.3 2.85 4.5 5.25 4.5 1.65 0 3.9-.3 6.75-1.5 5.55-2.25 6.75-6.75 6.75-6.75z" />
                    </svg>
                </div>

                <nav>
                    <ul>
                        <li><a href="#">Men</a></li>
                        <li><a href="#">Women</a></li>
                        <li><a href="#">Kids</a></li>
                        <li><a href="#">Customise</a></li>
                        <li><a href="#">Sale</a></li>
                        <li><Link to="/signin">Sign In</Link></li>
                    </ul>
                </nav>

                <div className="header-icons">
                    <button className="icon-btn" aria-label="Search">
                        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                    <button className="icon-btn cart-badge" aria-label="Cart">
                        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                    </button>
                </div>
            </header>

            <main>
                <div className="dashed-line"></div>

                <div className="hero-container">
                    {/* Left Column */}
                    <div className="hero-left">
                        <p className="tagline">
                            When the shoes get lighter, the moves get tighter.
                        </p>
                        <div className="social-icons">
                            <svg className="social-icon" viewBox="0 0 24 24">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                            <svg className="social-icon" viewBox="0 0 24 24">
                                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                            </svg>
                        </div>
                    </div>

                    {/* Center Column */}
                    <div className="hero-center">
                        <img
                            src={heroImage}
                            alt="Nike SpeedRep Training Shoe"
                            className="shoe-image"
                        />
                        <Link to="/signup">
                            <button className="cta-button">Shop now</button>
                        </Link>
                    </div>

                    {/* Right Column */}
                    <div className="hero-right">
                        <div className="product-nav">
                            <span className="nav-arrow">←</span>
                            <span>MEN'S TRAINING SHOE</span>
                            <span className="nav-arrow">→</span>
                        </div>
                        {/* Blurred shoe hint in background/right */}
                        <img
                            src={heroImage}
                            alt=""
                            className="blurred-shoe"
                        />
                    </div>
                </div>

                <div className="promo-text">
                    FREE DELIVERY | Applies to orders of $200 or more. View details
                </div>
            </main>
        </div>
    );
}
