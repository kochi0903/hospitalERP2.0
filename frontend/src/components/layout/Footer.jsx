import React from "react";
import data from '../../assets/static/data.json'

const Footer = () => {
  return (

    <footer className="bg-gradient-to-r from-blue-800 to-indigo-700 text-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-300">Emergency Care</a></li>
              <li><a href="#" className="hover:text-blue-300">ICU</a></li>
              <li><a href="#" className="hover:text-blue-300">Pharmacy</a></li>
              <li><a href="#" className="hover:text-blue-300">Diagnostics</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Working Hours</h4>
            {Object.keys(data?.footer_workingHours || {}).map((key, index) => (
              <p key={index}>
                {key}: {data?.footer_workingHours[key]}
              </p>
            ))}
          </div>
          {/* <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-300">Facebook</a>
              <a href="#" className="hover:text-blue-300">Twitter</a>
              <a href="#" className="hover:text-blue-300">Instagram</a>
            </div>
          </div> */}
        </div>
      </div>
    </footer>

  );
};

export default Footer;
