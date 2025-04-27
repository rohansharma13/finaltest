import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import PreHeroModel from "./PreHeroModel";
import HeroModel from "./HeroModel";
import ProductPhotography from "./ProductPhotography";
import SEO from "./SEO";
import Loader from "./Loader"; // Import your custom loader or use a pre-built one

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  const [loading, setLoading] = useState(true);
  const sectionsRef = useRef([]);
  const lenisRef = useRef(null);
  const [textAnimationDone, setTextAnimationDone] = useState(false);

  // Simulating delay for loader
  useEffect(() => {
    setTimeout(() => {
      setLoading(false); // Hide loader after a delay
    }, 4000); // 3 seconds delay (adjust as needed)
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      smooth: true,
      direction: "vertical",
      gestureDirection: "vertical",
      smoothTouch: true,
      lerp: 0.03,
    });

    lenisRef.current = lenis;

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      lenis.scrollTo(0);
    }, 50);

    lenis.stop();

    function raf(time) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (textAnimationDone) {
      lenisRef.current?.start();

      sectionsRef.current.forEach((section, index) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=200%",
            pin: true,
            scrub: false,
            pinSpacing: false,
          },
        });

        tl.to({}, { duration: 3 });

        if (index !== 0) {
          gsap.fromTo(
            section,
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "power2.out",
              duration: 1,
              scrollTrigger: {
                trigger: section,
                start: "top 60%",
                end: "top 20%",
                scrub: true,
              },
            }
          );
        }
      });
    }
  }, [textAnimationDone]);

  const sectionStyle = {
    minHeight: "100svh",
    height: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  };

  return (
    <div>
      {loading && <Loader />} {/* Show the loader when loading */}

      <section
        ref={(el) => (sectionsRef.current[0] = el)}
        style={{ ...sectionStyle, backgroundColor: "black" }}
      >
        <PreHeroModel onTextAnimationComplete={() => setTextAnimationDone(true)} />
      </section>

      <section
        ref={(el) => (sectionsRef.current[1] = el)}
        style={{ ...sectionStyle, backgroundColor: "black" }}
      >
        <HeroModel />
      </section>

      <section
        ref={(el) => (sectionsRef.current[2] = el)}
        style={{ ...sectionStyle, backgroundColor: "#93C572" }}
      >
        <SEO />
      </section>

      <section
        ref={(el) => (sectionsRef.current[3] = el)}
        style={{ ...sectionStyle, backgroundColor: "grey" }}
      >
        <ProductPhotography />
      </section>
    </div>
  );
};

export default App;
