import React from "react";
import Carousel from "react-multi-carousel";
// import Pediatrics from "../assets/departments/pedia.jpg";
// import Orthopedics from "../assets/departments/ortho.jpg";
// import Cardiology from "../assets/departments/cardio.jpg";
// import Neurology from "../assets/departments/neuro.jpg";
// import Oncology from "../assets/departments/onco.jpg";
// import Radiology from "../assets/departments/radio.jpg";
import "react-multi-carousel/lib/styles.css";
import data from '../../assets/static/data.json'

const Team = () => {
  const responsive = {
    extraLarge: {
      breakpoint: { max: 3000, min: 1324 },
      items: 4,
      slidesToSlide: 1, // optional, default to 1.
    },
    large: {
      breakpoint: { max: 1324, min: 1005 },
      items: 3,
      slidesToSlide: 1, // optional, default to 1.
    },
    medium: {
      breakpoint: { max: 1005, min: 700 },
      items: 2,
      slidesToSlide: 1, // optional, default to 1.
    },
    small: {
      breakpoint: { max: 700, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  return (
    <>
      {/* <div className="max-w-[950px] mx-auto flex flex-col justify-center px-4 text-gray-200 pb-8 md:py-12" id="department">
        <h2 className="text-3xl font-bold mb-4 text-center">Departments</h2>
        <Carousel
          responsive={responsive}
          removeArrowOnDeviceType={[
            "superLargeDesktop",
            "desktop",
            "tablet",
            "mobile",
          ]}
        >
          {departmentsArray.map((depart, index) => {
            return (
              <div
                key={index}
                className="border border-purple-900 p-6 rounded-md bg-purple-900/20 shadow-lg w-full md:w-3/4"
              >
                <h3 className="text-lg font-bold mb-2 text-center">{depart.name}</h3>
                <div className="flex justify-center items-center">
                  <img
                    src={depart.imageUrl}
                    className="h-24 w-48 object-cover rounded-md"
                    alt="Department"
                  />
                </div>
              </div>
            );
          })}

        </Carousel>
      </div> */}
      <div id="doctors">
        <section className="py-16 bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-orange-800">Our Team</h2>
            <Carousel
              responsive={responsive}
              removeArrowOnDeviceType={[
                "superLargeDesktop",
                "desktop",
                "tablet",
                "mobile",
              ]}
            >
              {data?.teamsArray.map((member) => (
                <div key={member?.name} className="bg-white p-6 rounded-lg shadow-md text-center mx-2">
                  <div className="w-32 h-32 mx-auto bg-orange-200 rounded-full mb-4"></div>
                  <h3 className="text-xl font-semibold text-orange-700">{member?.name}</h3>
                  <p className="text-gray-600">{member?.specialisation}</p>
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      </div>
    </>
  );
};

export default Team;