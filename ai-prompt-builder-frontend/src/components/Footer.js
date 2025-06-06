import React from 'react';

// Component for the page footer
const Footer = () => {
    return (
        <footer className="mt-16 border-t border-gray-200 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* Brand Info */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-primary-600 text-white p-1 rounded-md">
                            <span className="material-symbols-outlined">psychology</span>
                        </div>
                        <span className="font-bold text-xl">PromptShare</span>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">
                        The platform for creating, sharing and testing LLM prompts.
                    </p>
                    {/* Social Media Links - Replace # with actual links */}
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Twitter">
                            <i className="fa-brands fa-twitter text-lg"></i>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Discord">
                            <i className="fa-brands fa-discord text-lg"></i>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="GitHub">
                            <i className="fa-brands fa-github text-lg"></i>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="YouTube">
                            <i className="fa-brands fa-youtube text-lg"></i>
                        </a>
                    </div>
                </div>

                {/* Platform Links */}
                <div>
                    <h4 className="font-bold mb-4 text-base">Platform</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                                Features
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                                Marketplace
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                                Pricing
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                                API
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                                Integrations
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Resources Links */}
                <div>
                    <h4 className="font-bold mb-4 text-base">Resources</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                                Documentation
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                                Guides
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                                Blog
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                                Tutorials
                            </a>
                        </li>
                    </ul>
                </div>

            </div>
             {/* Optional: Add copyright or other footer text below the columns */}
             <div className="text-center text-gray-500 text-sm mt-8">
                 © {new Date().getFullYear()} PromptShare. All rights reserved.
             </div>
        </footer>
    );
};

export default Footer;
