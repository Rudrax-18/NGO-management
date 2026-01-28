import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  GlobeAltIcon,
  ShieldCheckIcon,
  SparklesIcon,
  HandThumbUpIcon,
  ChartBarIcon,
  LightBulbIcon,
  FireIcon,
  RocketLaunchIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';

const AnimatedCounter = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      let startTime = null;
      const animateCount = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      };
      requestAnimationFrame(animateCount);
    }
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const TestimonialCard = ({ testimonial, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center mb-4">
        <img 
          src={testimonial.image} 
          alt={testimonial.name}
          className="w-16 h-16 rounded-full object-cover mr-4"
        />
        <div>
          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
          <p className="text-sm text-gray-600">{testimonial.role}</p>
        </div>
      </div>
      <p className="text-gray-700 italic">"{testimonial.content}"</p>
      <div className="flex mt-4">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        ))}
      </div>
    </motion.div>
  );
};

const TeamMember = ({ member, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
    >
      <div className="relative">
        <img 
          src={member.image} 
          alt={member.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{member.name}</h3>
          <p className="text-sm opacity-90">{member.position}</p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">{member.bio}</p>
        <div className="flex space-x-3">
          {member.social?.linkedin && (
            <a href={member.social.linkedin} className="text-gray-400 hover:text-blue-600">
              <span className="text-xl">in</span>
            </a>
          )}
          {member.social?.twitter && (
            <a href={member.social.twitter} className="text-gray-400 hover:text-blue-400">
              <span className="text-xl">𝕏</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState('mission');
  const [ref1, inView1] = useInView({ triggerOnce: true });
  const [ref2, inView2] = useInView({ triggerOnce: true });

  const stats = [
    { icon: UserGroupIcon, value: 50000, label: 'Lives Impacted', suffix: '+' },
    { icon: AcademicCapIcon, value: 100, label: 'Educational Centers', suffix: '+' },
    { icon: HeartIcon, value: 10000000, label: 'Donations Raised', suffix: '+' },
    { icon: GlobeAltIcon, value: 25, label: 'States Reached', suffix: '+' }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Beneficiary, Mumbai',
      content: 'Impact Foundation changed my life. Their educational program helped me complete my studies and get a good job.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Rajesh Kumar',
      role: 'Donor, Delhi',
      content: 'I\'ve been donating for 3 years and the transparency and impact reports keep me motivated to contribute more.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Anita Patel',
      role: 'Volunteer, Ahmedabad',
      content: 'Working with Impact Foundation has been incredibly rewarding. Seeing the direct impact of our work is amazing.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const team = [
    {
      name: 'Dr. Rajiv Mehta',
      position: 'Founder & CEO',
      bio: 'With over 20 years of experience in social work, Dr. Mehta founded Impact Foundation to create sustainable change.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      }
    },
    {
      name: 'Priya Nair',
      position: 'Co-Founder & COO',
      bio: 'Priya brings her expertise in operations and management to ensure our programs run efficiently and reach maximum impact.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      social: {
        linkedin: 'https://linkedin.com'
      }
    },
    {
      name: 'Amit Singh',
      position: 'Director of Programs',
      bio: 'Amit leads our educational initiatives with a focus on quality education and skill development for underprivileged children.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      }
    },
    {
      name: 'Dr. Sarah Johnson',
      position: 'Director of Healthcare',
      bio: 'Dr. Johnson oversees our healthcare programs, ensuring quality medical services reach remote communities.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      social: {
        linkedin: 'https://linkedin.com'
      }
    }
  ];

  const partners = [
    { name: 'Google.org', logo: '🌐' },
    { name: 'Microsoft Philanthropies', logo: '💻' },
    { name: 'Tata Trusts', logo: '🏢' },
    { name: 'Reliance Foundation', logo: '⚡' },
    { name: 'Adani Group', logo: '🔋' },
    { name: 'Infosys Foundation', logo: '💼' }
  ];

  return (
    <>
      <Helmet>
        <title>About Us - Impact Foundation</title>
        <meta name="description" content="Learn about Impact Foundation's mission, vision, and team dedicated to making a difference in communities." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
          <div className="container-custom relative z-10">
            <motion.div
              ref={ref1}
              initial={{ opacity: 0, y: 30 }}
              animate={inView1 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                About <span className="text-yellow-300">Impact Foundation</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-gray-100">
                Creating lasting change in communities through education, healthcare, and sustainable development since 2015.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 font-semibold">
                  Join Our Mission
                </button>
                <button className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 font-semibold">
                  View Annual Report
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-20 left-10"
          >
            <HeartIcon className="h-8 w-8 text-yellow-300 opacity-60" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="absolute bottom-20 right-10"
          >
            <SparklesIcon className="h-8 w-8 text-yellow-300 opacity-60" />
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <motion.div
              ref={ref2}
              initial={{ opacity: 0, y: 30 }}
              animate={inView2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
                Our Impact in Numbers
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                      <stat.icon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                      ₹<AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="text-gray-600">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision Tabs */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
              Our Purpose
            </h2>
            
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
                {['mission', 'vision', 'values'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-md font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              {activeTab === 'mission' && (
                <div className="text-center">
                  <RocketLaunchIcon className="h-16 w-16 text-primary-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                    To empower communities and transform lives through transparent, impactful charitable initiatives focused on education, healthcare, and sustainable development. We believe in creating opportunities that enable individuals to break the cycle of poverty and build a brighter future.
                  </p>
                </div>
              )}
              
              {activeTab === 'vision' && (
                <div className="text-center">
                  <LightBulbIcon className="h-16 w-16 text-primary-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Our Vision 2026</h3>
                  <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                    To create a world where every individual has access to quality education, healthcare, and opportunities for growth. By 2026, we aim to impact 1 million lives across 50+ communities through our sustainable development programs.
                  </p>
                </div>
              )}
              
              {activeTab === 'values' && (
                <div className="text-center">
                  <FireIcon className="h-16 w-16 text-primary-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Our Values</h3>
                  <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="text-center">
                      <ShieldCheckIcon className="h-12 w-12 text-primary-600 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Transparency</h4>
                      <p className="text-gray-600">Every donation tracked and reported</p>
                    </div>
                    <div className="text-center">
                      <HandThumbUpIcon className="h-12 w-12 text-primary-600 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Integrity</h4>
                      <p className="text-gray-600">Upholding highest ethical standards</p>
                    </div>
                    <div className="text-center">
                      <ChartBarIcon className="h-12 w-12 text-primary-600 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Impact</h4>
                      <p className="text-gray-600">Measurable and sustainable change</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
              Meet Our Team
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <TeamMember key={index} member={member} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
              Stories of Impact
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
              Our Partners
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {partners.map((partner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{partner.logo}</div>
                    <p className="text-sm font-medium text-gray-700">{partner.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Us in Making a Difference
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Every contribution, big or small, helps us create lasting change in communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 font-semibold">
                Donate Now
              </button>
              <button className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 font-semibold">
                Become a Volunteer
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
