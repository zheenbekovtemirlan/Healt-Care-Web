import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/HomePage.css";
import { specialtyIcons } from "../utils/specialtyIcons";
import pillsGreen from "../assets/green_pills.png";
import getBandage from "../assets/Bandage.png";
import API from "../utils/axiosConfig";

const specialtiesList = [
  "dentists",
  "psychiatrists",
  "cardiologists",
  "surgeons",
  "pulmonologists",
  "therapists",
  "nephrologists",
  "traumatologists"
];

const HomePage = () => {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(200);
  const [specialties, setSpecialties] = useState([]);
  const navigate = useNavigate();
  const specialtiesRef = useRef(null);

  const scrollToSpecialties = () => {
    specialtiesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // typing animation
  useEffect(() => {
    const current = specialtiesList[loopNum % specialtiesList.length];

    const handleTyping = () => {
      setText((prev) =>
        isDeleting
          ? current.substring(0, prev.length - 1)
          : current.substring(0, prev.length + 1)
      );

      if (!isDeleting && text === current) {
        setTimeout(() => setIsDeleting(true), 1200);
        setTypingSpeed(80);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(200);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  // load specialties from api
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await API.get("/specialties");
        const data = response.data;

        const mapped = data.map((spec) => ({
          ...spec,
          image: specialtyIcons[spec.name],
        }));
        setSpecialties(mapped);
      } catch (err) {
        console.error("Failed to load specialties", err);
      }
    };

    fetchSpecialties();
  }, []);

  return (
    <>
      <Header />
      <div className="home">
        <section className="hero">
          <h1>
            Book local <span className="typed-word">{text}</span>
            <span className="cursor">|</span>
            <br />
            who take care of your health.
          </h1>
        </section>

        <section ref={specialtiesRef} className="specialties">
          <h2>Top-searched specialties</h2>
          <div className="specialties-grid">
            {specialties.map((spec) => (
              <div
                className="specialty-card"
                key={spec.id || spec.name}
                onClick={() => navigate(`/doctors?specialtyId=${spec.id}`)}
                style={{ cursor: "pointer" }}
              >
                <img src={spec.image} alt={spec.name} />
                <p>{spec.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="service-banner">
          <div className="pills-container">
            <img src={pillsGreen} alt="Green Pills Decoration" />
          </div>

          <div className="cross-container">
            <img src={getBandage} alt="Bandage Cross Icon" />
          </div>

          <div className="service-banner-content">
            <div className="card-container">
              <div className="service-card appointment">
                <div className="card-text">
                  <h3>
                    Book an<br />appointment<br />today.<br />Online.
                  </h3>
                </div>
                <span onClick={scrollToSpecialties} className="service-link" style={{ cursor: "pointer" }}>
                  See specialties
                </span>
              </div>
              <p className="card-before">Before it's too late.</p>
            </div>

            <div className="card-container">
              <div className="service-card reviews">
                <div className="card-text">
                  <h3><strong>Read reviews from users</strong></h3>
                </div>
                <Link to="#" className="service-link">
                  READ REVIEWS
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;






