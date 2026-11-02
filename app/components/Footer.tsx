"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Company Info */}
          <div>
            <div className="relative w-32 h-12 mb-6">
              <Image src="/logo-black.png" alt="Al Anfal Doc" fill className="object-contain" />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Aliquam orci a nullam tempor undo sapien donec gravida an enim ipsum porta justo velna auctor and congue magna laoreet an augue sapien
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900">Contact Details</h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li>121 King Street, Melbourne,<br />Victoria 3000 Australia</li>
              <li>Phone: +12 9 8765 4321</li>
              <li>Email: <a href="mailto:hello@demo.com" className="hover:text-[#ff5722]">hello@demo.com</a></li>
              <li className="pt-2">
                Mon-Fri: 9:00AM - 6:30PM<br />
                Saturday: 8:30AM - 3:30PM<br />
                Sunday: Closed
              </li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900">Useful Links</h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">About ImmiEx</Link></li>
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Visa Information</Link></li>
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Immigration FAQ</Link></li>
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Immigration Assistance</Link></li>
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">ImmiEx Testimonials</Link></li>
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Terms and Conditions</Link></li>
            </ul>
          </div>

          {/* Visas */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900">Visas</h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Visitor Visas</Link></li>
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Permanent Residence Visas</Link></li>
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Business Visas</Link></li>
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Working Holiday Visas</Link></li>
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Studying & Training Visas</Link></li>
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Skilled Work Visas</Link></li>
              <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Family & Partner Visas</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © Copyright <span className="font-semibold text-gray-900">ImmiEx 2019</span>. All Rights Reserved
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-[#ff5722] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#ff5722] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#ff5722] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#ff5722] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#ff5722] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
