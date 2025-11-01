import React from 'react';
import Footer from '../components/Footer';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import SubdirectoryArrowRightTwoToneIcon from '@mui/icons-material/SubdirectoryArrowRightTwoTone';
import LocalHospitalTwoToneIcon from '@mui/icons-material/LocalHospitalTwoTone';

const Aboutus = () => {
  return (
    <>
      <div className="bg-gray-100 min-h-screen p-8 relative">

        {/* Title Section */}
        <div className="text-3xl font-extrabold text-blue-600 mb-8 underline">
          <h4>
            <AddReactionIcon className="mr-2" />
            Laughter is the Best Medicine, but We've Got the Second Best...
          </h4>
        </div>

        <div className="max-w-screen-xl mx-auto text-center">
          
          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 underline">
            About Us
          </h1>

          {/* Mission Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Mission Text */}
            <div>
              <h2 className="text-xl font-semibold text-red-600 mb-4">
                Our Mission
              </h2>

              <div className="text-gray-700 space-y-4 text-justify">
                <p>
                  <LocalHospitalTwoToneIcon className="mr-1" />
                  At Easypharma, our mission is to redefine global healthcare
                  through a relentless pursuit of innovation, patient-centered
                  solutions, and unwavering ethical standards. We strive to develop
                  cutting-edge pharmaceuticals that address current needs while
                  anticipating future medical challenges.
                </p>

                <p>
                  Our dedication extends beyond scientific advancements. We uphold
                  integrity, transparency, and global accessibility. We empower a
                  diverse workforce, fostering inclusion, collaboration, and
                  scientific excellence.
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="md:flex md:items-center">
              <img
                src="https://images.unsplash.com/photo-1617881770125-6fb0d039ecde?w=500&auto=format&fit=crop&q=60"
                alt="About Pharma Store"
                className="w-full h-auto md:w-96 mx-auto rounded-md"
              />
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              OUR PHARMACY BENEFITS
            </h2>
          </div>

          <div className="mt-8 text-gray-700 text-left mx-auto max-w-lg space-y-2">
            <p><SubdirectoryArrowRightTwoToneIcon className="mr-2" /> Health at Your Fingertips</p>
            <p><SubdirectoryArrowRightTwoToneIcon className="mr-2" /> Confidential Care, Conveniently Delivered</p>
            <p><SubdirectoryArrowRightTwoToneIcon className="mr-2" /> Empowering Wellness through Information</p>
            <p><SubdirectoryArrowRightTwoToneIcon className="mr-2" /> Seamless Medication Management</p>
            <p><SubdirectoryArrowRightTwoToneIcon className="mr-2" /> 24/7 Health Support</p>
          </div>

        </div>

        <Footer />
      </div>
    </>
  );
};

export default Aboutus;
