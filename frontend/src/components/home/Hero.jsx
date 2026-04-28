import profilepic from "../../assets/nursingPic.png";
import { TypeAnimation } from "react-type-animation";
import ShinyEffect from "../ShinyEffect";
import { motion } from "framer-motion";
import data from "../../assets/static/data.json";

const Hero = () => {
  return (
    <div className="mt-24 max-w-[1400px] mx-auto relative overflow-hidden">
      <div className="grid md:grid-cols-2 place-items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="pl-4 md:pl-2"
        >
          <TypeAnimation
            sequence={[
              "Providing Compassionate Care Since 1985",
              1000,
              "Founder Dr. Ganesh Chandra Roy",
              1000,
            ]}
            speed={50}
            repeat={Infinity}
            className="font-bold text-gray-400 text-xl md:text-5xl italic- mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-gray-400 md:text-7xl text-5xl tracking-tight mb-4"
          >
            SHANTI CLINIC &
            <span className="text-purple-500"> NURSING HOME</span>
          </motion.p>
        </motion.div>
        <motion.img
          src={profilepic}
          className="w-[300px] md:w-[450px]"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 2 }}
        className="flex flex-col px-12 md:px-0 w-full justify-center items-center py-24"
      >
        <div className="mb-4">
          <a
            href={`tel:${data?.contact?.emergency}`}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 shadow-lg inline-block"
          >
            Contact Us
          </a>
        </div>
        <div>
          <a
            href="tel:+911234567890"
            className="text-red-600 font-bold text-xl hover:text-red-700"
          >
            Emergency: {data?.contact?.emergency}
          </a>
        </div>
      </motion.div>
      <div className="absolute inset-0 hidden md:block">
        <ShinyEffect left={0} top={0} size={1400} />
      </div>
    </div>
  );
};
export default Hero;
