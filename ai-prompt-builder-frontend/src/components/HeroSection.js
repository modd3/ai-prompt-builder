import React from 'react';

// Component for the top hero section of the page.
// It now only contains the promotional text and image, not navigation elements.
// Handlers for buttons are still passed down in case you want buttons within the hero
// that trigger navigation (e.g., a "Get Started" button).
const HeroSection = ({ onCreatePromptClick, onExplorePromptsClick }) => {
    return (
        <section className="mb-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                    {/* Hero Title */}
                    <h2 className="text-4xl font-bold mb-4">
                        Create, Share & Test <span className="text-primary-600">LLM Prompts</span>
                    </h2>
                    {/* Hero Description */}
                    <p className="text-gray-600 mb-6 text-lg">
                        Join our community of prompt engineers and AI enthusiasts to discover, create and
                        test powerful prompts for large language models.
                    </p>
                    {/* Buttons within the Hero section (Optional - can be removed if only in Navbar) */}
                    {/* These buttons call handlers passed from HomePage to control sections */}
                    <div className="flex gap-4">
                        <button
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-1"
                            onClick={onCreatePromptClick} // Call the handler passed from parent
                        >
                            Create Prompt
                        </button>
                        <button
                            className="border border-gray-300 hover:border-primary-600 px-6 py-3 rounded-lg font-medium transition-all hover:shadow hover:-translate-y-1"
                            onClick={onExplorePromptsClick} // Call the handler passed from parent
                        >
                            Explore Prompts
                        </button>
                    </div>
                </div>
                {/* Hero Image */}
                <div className="md:w-1/2">
                    <img
                        src="https://images.unsplash.com/photo-1525338078858-d762b5e32f2c?crop=entropy&cs=tinysrgb&fit=max&fm-jpg&ixid=M3w3MzkyNDZ8MHwxfHNlYXJjaHwxfHxhaXxlbnwwfHx8fDE3NDYxODgxODl8MA&ixlib=rb-4.0.3&q=80&w=1080"
                        alt="AI prompt engineering"
                        className="rounded-xl shadow-lg w-full hover:shadow-xl transition-shadow"
                    />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
