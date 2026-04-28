import React from 'react'
import data from '../../assets/static/data.json'

function Facilities() {
    return (
        <div>
            <section className="py-16 bg-gradient-to-r from-teal-50 to-green-50">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12 text-teal-800">Facilities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {data?.facilities.map((facility, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-semibold mb-4 text-teal-700">{facility.name}</h3>
                                <ul className="list-disc list-inside text-gray-600">
                                    {facility.facilities.map((data, index) => {
                                        return (
                                            <li key={index}>{data}</li>
                                        )
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section></div>
    )
}

export default Facilities