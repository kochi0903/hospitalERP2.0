import React, { useState } from 'react'
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai'
import { Link } from 'react-scroll'
import { motion } from 'framer-motion'

const Navbar = () => {
    const [nav, setNav] = useState(false)

    const toggleNav = () => {
        setNav(!nav)
    }

    const closeNav = () => {
        setNav(false)
    }

    const menuVariants = {
        open: {
            x: 0,
            transition: {
                stiffness: 20,
                damping: 15
            }
        },
        closed: {
            x: '-100%',
            transition: {
                stiffness: 20,
                damping: 15
            }
        }
    }

    return (
        <div className='fixed top-0 left-0 w-full bg-opacity-70 backdrop-blur-md z-50'>
            <div className='max-w-[1300px] mx-auto  flex justify-between text-black-200 text-xl items-center px-12 h-20'>

                <a href="#">Shanti Clinic Nursing</a>

                <ul className='hidden md:flex gap-12 z-10 cursor-pointer'>
                    <li><Link to="about" smooth={true} offset={-20} duration={250}>About</Link></li>
                    <li><Link to="doctors" smooth={true} offset={-20} duration={250}>Medical Team</Link></li>
                    <li><Link to="contact" smooth={true} offset={-20} duration={250}>Contact</Link></li>

                </ul>
                <div onClick={toggleNav} className='md:hidden z-50 text-gray-200'>
                    {nav ? <AiOutlineClose size={30} /> : <AiOutlineMenu size={30} />}
                </div>
                <motion.div
                    initial={false}
                    animate={nav ? 'open' : 'closed'}
                    variants={menuVariants}
                    className='fixed left-0 top-0 w-full min-h-screen bg-gray-500 z-40'
                >
                    <ul className='font-semibold text-4xl space-y-8 mt-24 text-center'>
                        <li><Link to="about" onClick={closeNav} smooth={true} offset={-20} duration={250}>About</Link></li>
                        <li><Link to="doctors" onClick={closeNav} smooth={true} offset={-20} duration={250}>Medical Team</Link></li>
                        <li><Link to="contact" onClick={closeNav} smooth={true} offset={-20} duration={250}>Contact</Link></li>
                    </ul>
                </motion.div>
            </div>
        </div>
    )
}

export default Navbar