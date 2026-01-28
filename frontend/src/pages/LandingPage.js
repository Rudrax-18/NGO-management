import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  HeartIcon, 
  ShieldCheckIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  AcademicCapIcon,
  HandThumbUpIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { donationAPI } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Counter from '../components/UI/Counter';

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalDonors: 0,
    averageDonation: 0,
    recentDonations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await donationAPI.getPublicStats();
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: '80G Certified',
      description: 'All donations are eligible for tax exemption under section 80G',
      color: 'text-green-600'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Transparent Donations',
      description: 'Track every rupee with real-time updates and detailed reports',
      color: 'text-blue-600'
    },
    {
      icon: HeartIcon,
      title: 'Secure Payments',
      description: 'Razorpay secured payment gateway with multiple payment options',
      color: 'text-purple-600'
    }
  ];

  const impactAreas = [
    {
      icon: AcademicCapIcon,
      title: 'Education',
      description: 'Providing quality education to underprivileged children',
      stats: '10,000+ Students'
    },
    {
      icon: HeartIcon,
      title: 'Healthcare',
      description: 'Medical facilities and health camps in rural areas',
      stats: '50+ Health Camps'
    },
    {
      icon: HandThumbUpIcon,
      title: 'Community',
      description: 'Empowering communities through sustainable development',
      stats: '100+ Villages'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Donor since 2022',
      content: 'Impact Foundation has made it so easy to contribute to meaningful causes. The transparency and regular updates keep me motivated.',
      avatar: '👨‍💼'
    },
    {
      name: 'Priya Sharma',
      role: 'Monthly Donor',
      content: 'I love how I can track the impact of my donations. The 80G certificates are always delivered on time for tax benefits.',
      avatar: '👩‍🏫'
    },
    {
      name: 'Amit Patel',
      role: 'Corporate Partner',
      content: 'Our partnership with Impact Foundation has helped us fulfill our CSR goals while making a real difference in society.',
      avatar: '👨‍💻'
    }
  ];

  const partners = [
    { name: 'Reliance Foundation', logo: '🏢' },
    { name: 'Tata Trusts', logo: '🏭' },
    { name: 'Adani Group', logo: '⚡' },
    { name: 'Infosys Foundation', logo: '💻' },
    { name: 'Wipro Cares', logo: '🌐' },
    { name: 'HCL Foundation', logo: '🔧' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Impact Foundation - Donate Today, Change Lives</title>
        <meta name="description" content="Join Impact Foundation in making a difference. 80G certified NGO with transparent donation system and secure payment gateway." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50"></div>
        
        <div className="relative container-custom text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-shadow">
              Donate Today
              <span className="block text-3xl md:text-5xl lg:text-6xl mt-2 text-yellow-300">
                Change Lives
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Join thousands of donors making a real difference in education, healthcare, and community development across India.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/donate"
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-large hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Donate Now
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/about"
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold"
              >
                See Impact
              </Link>
            </div>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                ₹<Counter end={stats.totalRaised / 100000} duration={2000} />L+
              </div>
              <div className="text-white">Raised for Impact</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                <Counter end={stats.totalDonors / 1000} duration={2000} />K+
              </div>
              <div className="text-white">Trusted Donors</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                <Counter end={stats.averageDonation} duration={2000} />
              </div>
              <div className="text-white">Average Donation</div>
            </div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float">
          <SparklesIcon className="h-8 w-8 text-yellow-300 opacity-60" />
        </div>
        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <HeartIcon className="h-6 w-6 text-white opacity-40" />
        </div>
        <div className="absolute bottom-20 left-20 animate-float" style={{ animationDelay: '2s' }}>
          <ChartBarIcon className="h-7 w-7 text-yellow-200 opacity-50" />
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Why Choose Impact Foundation?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We ensure your donations create maximum impact with complete transparency and security.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card text-center group"
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Areas Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Our Impact Areas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Focusing on key areas that create sustainable change in communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {impactAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card group cursor-pointer"
              >
                <div className="w-16 h-16 mb-6 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors duration-200">
                  <area.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{area.title}</h3>
                <p className="text-gray-600 mb-4">{area.description}</p>
                <div className="text-primary-600 font-semibold">{area.stats}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Donations */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Recent Donations
            </h2>
            <p className="text-xl text-gray-600">
              Join our community of generous donors making a difference every day.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-medium p-6">
            <div className="space-y-4">
              {stats.recentDonations.slice(0, 5).map((donation, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <HeartIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium">{donation.donorName}</div>
                      <div className="text-sm text-gray-500">{formatRelativeTime(donation.date)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary-600">
                      {formatCurrency(donation.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              What Our Donors Say
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our amazing community of supporters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Our Trusted Partners
            </h2>
            <p className="text-xl text-gray-600">
              Working together with leading organizations to maximize impact.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-200"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{partner.logo}</div>
                  <div className="text-sm font-medium text-gray-600">{partner.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container-custom text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Every donation counts. Start your journey of impact today and join thousands of donors changing lives.
            </p>
            <Link
              to="/donate"
              className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-large hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Donating
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

// Helper function
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default LandingPage;
