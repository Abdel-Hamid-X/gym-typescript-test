import Navbar from "@/scenes/navbar"
import Home from "@/scenes/home"
import Benefits from "@/scenes/benefits"
import OurClasses from "@/scenes/ourClasses"
import ContactUs from "@/scenes/contactUs"
import Footer from"@/scenes/footer"
import { useEffect, useState } from "react";
import { SelectedPage } from "@/shared/types";

function App() {
  const [
    selectedPage,
    setselectedPage] = useState<SelectedPage>(
      SelectedPage.Home
    );
  const [
    isTopOfPage,
    setIsTopOfPage] = useState(
      true
    );
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setIsTopOfPage(true);
        setselectedPage(SelectedPage.Home);
      }
      if (window.scrollY !== 0)
        setIsTopOfPage(false);
    }
    window.addEventListener(
      "scroll",
      handleScroll
    );
    return () => window.removeEventListener(
      "scroll",
      handleScroll
    );
  }, []
  );

  return (
    <>
      <div className="App bg-gray-20">
        <Navbar
          istopofpage={isTopOfPage}
          selectedPage={selectedPage}
          setselectedPage={setselectedPage}
        />

        <Home
          setselectedPage={setselectedPage}
        />
        <Benefits
          setselectedPage={setselectedPage}
        />
        <OurClasses
          setselectedPage={setselectedPage}
        />
        <ContactUs
          setselectedPage={setselectedPage}
        />
        <Footer/>

      </div>
    </>
  )
}

export default App
