import Footer from "../components/layout/Footer";
import About from "../components/home/About";
import Contact from "../components/home/Contact";
import Facilities from "../components/home/Facilities";
import Hero from "../components/home/Hero";
import Team from "../components/home/Team";
import Navbar from "../components/layout/Navbar";

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Facilities />
      <Team />
      <Contact />
      <Footer />
    </>
  );
};

export default Home;
