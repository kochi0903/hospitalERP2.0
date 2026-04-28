import data from '../../assets/static/data.json'

const About = () => {
  return (
    <div id="about">
      <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-green-800">About Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-green-700">Our Mission</h3>
              <p className="text-gray-600">
                {data?.about?.mission}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-green-700">Our Accreditations & Memberships</h3>
              <ul className="list-disc list-inside text-gray-600">
                {data?.about?.accreditations.map((accreditation, index) => {
                  return (<li key={index}> {accreditation} </li>)
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About