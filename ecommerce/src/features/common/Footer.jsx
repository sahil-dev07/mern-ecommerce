import React from 'react'
import { Link } from 'react-router-dom'
const Footer = () => {
    return (
        <div className=" bg-gray-900">
            <div className="max-w-2xl mx-auto text-white py-10">
                <div className="text-center">
                    <h3 className="text-3xl mb-3"> Download our Ecommerce App .</h3>
                    <p> Buy what you want. </p>
                    <div className="flex justify-center my-10">
                        <div className="flex items-center border  rounded-lg px-4 py-2 w-52 mx-2">
                            {/* Inline Google Play icon — was a hotlinked flaticon.com CDN
                                URL; bundled inline so no external host can break it. */}
                            <svg className="w-7 md:w-8" viewBox="0 0 512 512" aria-label="Google Play" role="img">
                                <path fill="#00d4ff" d="M48 59.49v393a4.33 4.33 0 0 0 7.37 3.07L260 256 55.37 56.42A4.33 4.33 0 0 0 48 59.49z" />
                                <path fill="#00f076" d="M345.8 174 89.22 25.54l-.16-.09c-4.42-2.55-8.62 3.44-5 7.05L281.44 231z" />
                                <path fill="#ffc900" d="M472.94 256c0-8.14-4.22-16.27-12.6-20.93L400.68 200l-73.8 56 73.8 56 59.66-35.05C468.72 272.27 472.94 264.14 472.94 256z" />
                                <path fill="#ff3a44" d="M89.06 486.55c-3.61 3.61.59 9.6 5 7l256.74-148.49-64.32-64.32z" />
                            </svg>
                            <div className="text-left ml-3">
                                <p className="text-xs text-gray-200">Download on </p>
                                <p className="text-sm md:text-base"> Google Play Store </p>
                            </div>
                        </div>
                        <div className="flex items-center border  rounded-lg px-4 py-2 w-44 mx-2">
                            {/* Inline Apple icon — was a hotlinked flaticon.com CDN URL. */}
                            <svg className="w-7 md:w-8" viewBox="0 0 384 512" fill="#ffffff" aria-label="Apple" role="img">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                            </svg>
                            <div className="text-left ml-3">
                                <p className="text-xs text-gray-200">Download on </p>
                                <p className="text-sm md:text-base"> Apple Store </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-28 flex flex-col md:flex-row md:justify-between items-center text-sm text-gray-400">
                    <p className="order-2 md:order-1 mt-8 md:mt-0">
                        {" "}
                        © Sahil, 2023.{" "}
                    </p>
                    <div className="order-1 md:order-2">
                        <span className="px-2">
                            <Link to="https://sahil-my-portfolio.netlify.app/"
                                target='_blank' >
                                About us</Link>
                        </span>
                        <span className="px-2 border-l">Contact us</span>
                        <span className="px-2 border-l">Privacy Policy</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer