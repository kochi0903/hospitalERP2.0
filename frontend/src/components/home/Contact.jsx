import React from "react"
import data from '../../assets/static/data.json'

function Iframe(props) {
  return (<div dangerouslySetInnerHTML={{ __html: props.iframe ? props.iframe : "" }} />);
}

const iframe = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1827.3682500696593!2d88.13062782172604!3d23.64960584876026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f9a72997640f63%3A0xfeeb7489d1fc1327!2sSANTI%20CLINIC%20%26%20NURSING%20HOME!5e0!3m2!1sen!2sin!4v1736356170546!5m2!1sen!2sin" width="675" height="255" style="border:0;" loading="lazy"></iframe>';

const Contact = () => {
  return (
    <div id="contact">
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-800">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700">Location</h3>
              <p className="text-gray-600 mb-4">Lenin Sarani, Katwa, West Bengal 713130</p>
              <div className="relative w-full h-full md:h-full rounded-lg overflow-hidden">
                {/* Map Component */}
                <Iframe iframe={iframe} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700">Contact Information</h3>
              <ul className="space-y-4 text-gray-600">
                <li>Emergency: {data?.contact.emergency}</li>
                <li>Reception: {data?.contact.reception}</li>
                <li>Email: {data?.contact.email}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact