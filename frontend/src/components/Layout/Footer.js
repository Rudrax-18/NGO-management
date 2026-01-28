import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    organization: [
      { name: 'About Us', path: '/about' },
      { name: 'Our Mission', path: '/about' },
      { name: 'Team', path: '/about' },
      { name: 'Campaigns', path: '/campaigns' },
    ],
    support: [
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
    ],
    donate: [
      { name: 'One-time Donation', path: '/donate' },
      { name: 'Monthly Giving', path: '/donate' },
      { name: 'Corporate Partnerships', path: '/partnerships' },
      { name: '80G Tax Benefits', path: '/tax-benefits' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Organization Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <HeartIcon className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">Impact Foundation</span>
            </div>
            <p className="text-gray-300 mb-6">
              Creating lasting change in communities through education, healthcare, and sustainable development.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <EnvelopeIcon className="h-5 w-5 text-primary-400" />
                <span>info@impactfoundation.org</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <PhoneIcon className="h-5 w-5 text-primary-400" />
                <span>+91 12345 67890</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPinIcon className="h-5 w-5 text-primary-400" />
                <span>Jamnagar, Gujarat, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Organization</h3>
            <ul className="space-y-2">
              {footerLinks.organization.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Donate & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get Involved</h3>
            <ul className="space-y-2 mb-6">
              {footerLinks.donate.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  <span className="text-xl">f</span>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  <span className="text-xl">𝕏</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  <span className="text-xl">in</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Impact Foundation. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-gray-400 text-sm">
              <span>80G Certified</span>
              <span>•</span>
              <span>FCRA Registered</span>
              <span>•</span>
              <span>ISO 9001:2015</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
