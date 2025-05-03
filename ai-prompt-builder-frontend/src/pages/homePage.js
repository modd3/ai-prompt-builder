import React from "react"

export const Component = () => {
    return (
        <div id="webcrumbs">
            <div className="w-[1200px] p-6 bg-gradient-to-br from-white to-gray-50 font-sans">
                <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-600 text-white p-2 rounded-lg transform rotate-6 transition-transform hover:rotate-0">
                            <span className="material-symbols-outlined text-2xl">psychology</span>
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                            PromptShare
                        </h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#" className="font-medium hover:text-primary-600 transition-colors">
                            Discover
                        </a>
                        <a href="#" className="font-medium hover:text-primary-600 transition-colors">
                            Learn
                        </a>
                        <a href="#" className="font-medium hover:text-primary-600 transition-colors">
                            Community
                        </a>
                        <a href="#" className="font-medium hover:text-primary-600 transition-colors">
                            Pricing
                        </a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                            <span className="material-symbols-outlined">search</span>
                            <span>Search</span>
                        </button>
                        <details className="relative group">
                            <summary className="list-none flex items-center gap-2 cursor-pointer">
                                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <span className="material-symbols-outlined text-gray-500 group-hover:text-primary-600 transition-colors">
                                    expand_more
                                </span>
                            </summary>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg p-2 z-10">
                                <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                                    Profile
                                </a>
                                <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                                    Settings
                                </a>
                                <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                                    Logout
                                </a>
                            </div>
                        </details>
                    </div>
                </header>

                <main>
                    <section className="mb-12">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="md:w-1/2">
                                <h2 className="text-4xl font-bold mb-4">
                                    Create, Share & Test <span className="text-primary-600">LLM Prompts</span>
                                </h2>
                                <p className="text-gray-600 mb-6 text-lg">
                                    Join our community of prompt engineers and AI enthusiasts to discover, create and
                                    test powerful prompts for large language models.
                                </p>
                                <div className="flex gap-4">
                                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-1">
                                        Create Prompt
                                    </button>
                                    <button className="border border-gray-300 hover:border-primary-600 px-6 py-3 rounded-lg font-medium transition-all hover:shadow hover:-translate-y-1">
                                        Explore Prompts
                                    </button>
                                </div>
                            </div>
                            <div className="md:w-1/2">
                                <img
                                    src="https://images.unsplash.com/photo-1525338078858-d762b5e32f2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MzkyNDZ8MHwxfHNlYXJjaHwxfHxhaXxlbnwwfHx8fDE3NDYxODgxODl8MA&ixlib=rb-4.0.3&q=80&w=1080"
                                    alt="AI prompt engineering"
                                    className="rounded-xl shadow-lg w-full hover:shadow-xl transition-shadow"
                                    keywords="AI, prompt engineering, language models, artificial intelligence"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="mb-12">
                        <h3 className="text-2xl font-bold mb-6">Trending Prompts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="p-5">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-blue-600 text-sm">
                                                    smart_toy
                                                </span>
                                            </div>
                                            <span className="font-medium">ChatGPT</span>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                            High Success
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-lg mb-2">Product Description Generator</h4>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        Create compelling product descriptions for e-commerce with just a few details.
                                        Optimized for conversions.
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-yellow-500 text-sm">
                                                star
                                            </span>
                                            <span className="text-sm">4.8 (124)</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-gray-500 hover:text-primary-600 transition-colors">
                                                <span className="material-symbols-outlined">bookmark_add</span>
                                            </button>
                                            <button className="text-gray-500 hover:text-primary-600 transition-colors">
                                                <span className="material-symbols-outlined">share</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 flex justify-between border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300">
                                            <img
                                                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MzkyNDZ8MHwxfHNlYXJjaHwxfHx1c2VyfGVufDB8fHx8MTc0NjE4MDAxOXww&ixlib=rb-4.0.3&q=80&w=1080"
                                                alt="User avatar"
                                                className="w-full h-full object-cover"
                                                keywords="user, avatar, profile picture"
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">Sarah K.</span>
                                    </div>
                                    <button className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors">
                                        Try It
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="p-5">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-purple-600 text-sm">
                                                    magic_button
                                                </span>
                                            </div>
                                            <span className="font-medium">Midjourney</span>
                                        </div>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            Popular
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-lg mb-2">Photorealistic Portrait Generator</h4>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        Create stunning, realistic portraits with detailed style parameters for
                                        consistent results.
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-yellow-500 text-sm">
                                                star
                                            </span>
                                            <span className="text-sm">4.9 (89)</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-gray-500 hover:text-primary-600 transition-colors">
                                                <span className="material-symbols-outlined">bookmark_add</span>
                                            </button>
                                            <button className="text-gray-500 hover:text-primary-600 transition-colors">
                                                <span className="material-symbols-outlined">share</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 flex justify-between border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300">
                                            <img
                                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MzkyNDZ8MHwxfHNlYXJjaHwyfHx1c2VyfGVufDB8fHx8MTc0NjE4MDAxOXww&ixlib=rb-4.0.3&q=80&w=1080"
                                                alt="User avatar"
                                                className="w-full h-full object-cover"
                                                keywords="user, avatar, profile picture"
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">Michael T.</span>
                                    </div>
                                    <button className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors">
                                        Try It
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="p-5">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-red-600 text-sm">
                                                    table_chart
                                                </span>
                                            </div>
                                            <span className="font-medium">Claude</span>
                                        </div>
                                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                            New
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-lg mb-2">Data Analysis Expert</h4>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        Get clear insights from your data with structured analysis and visualization
                                        suggestions.
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-yellow-500 text-sm">
                                                star
                                            </span>
                                            <span className="text-sm">4.7 (42)</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-gray-500 hover:text-primary-600 transition-colors">
                                                <span className="material-symbols-outlined">bookmark_add</span>
                                            </button>
                                            <button className="text-gray-500 hover:text-primary-600 transition-colors">
                                                <span className="material-symbols-outlined">share</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 flex justify-between border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300">
                                            <img
                                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MzkyNDZ8MHwxfHNlYXJjaHwzfHx1c2VyfGVufDB8fHx8MTc0NjE4MDAxOXww&ixlib=rb-4.0.3&q=80&w=1080"
                                                alt="User avatar"
                                                className="w-full h-full object-cover"
                                                keywords="user, avatar, profile picture"
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">Alexa J.</span>
                                    </div>
                                    <button className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors">
                                        Try It
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-wrap gap-2">
                            <button className="px-3 py-1.5 rounded-full bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all">
                                All
                            </button>
                            <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-all">
                                ChatGPT
                            </button>
                            <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-all">
                                Midjourney
                            </button>
                            <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-all">
                                Claude
                            </button>
                            <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-all">
                                Gemini
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Sort by:</span>
                            <select className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option>Trending</option>
                                <option>Newest</option>
                                <option>Most Popular</option>
                                <option>Highest Rated</option>
                            </select>
                        </div>
                    </div>

                    <section className="mb-12">
                        <h3 className="text-2xl font-bold mb-6">Create Your Prompt</h3>
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">Prompt Title</label>
                                <input
                                    type="text"
                                    placeholder="Give your prompt a clear, descriptive title"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">Target Model</label>
                                <div className="flex flex-wrap gap-3">
                                    <button className="px-4 py-2 rounded-lg bg-primary-100 text-primary-800 font-medium border-2 border-primary-200 hover:bg-primary-200 transition">
                                        ChatGPT
                                    </button>
                                    <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium border-2 border-transparent hover:border-gray-200 transition">
                                        Claude
                                    </button>
                                    <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium border-2 border-transparent hover:border-gray-200 transition">
                                        Gemini
                                    </button>
                                    <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium border-2 border-transparent hover:border-gray-200 transition">
                                        Llama
                                    </button>
                                    <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium border-2 border-transparent hover:border-gray-200 transition">
                                        Midjourney
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2 font-medium">Prompt Content</label>
                                <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition">
                                    <div className="flex bg-gray-50 border-b border-gray-300 p-2">
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <span className="material-symbols-outlined text-gray-600">format_bold</span>
                                        </button>
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <span className="material-symbols-outlined text-gray-600">
                                                format_italic
                                            </span>
                                        </button>
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <span className="material-symbols-outlined text-gray-600">
                                                format_list_bulleted
                                            </span>
                                        </button>
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <span className="material-symbols-outlined text-gray-600">
                                                format_list_numbered
                                            </span>
                                        </button>
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <span className="material-symbols-outlined text-gray-600">functions</span>
                                        </button>
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <span className="material-symbols-outlined text-gray-600">code</span>
                                        </button>
                                    </div>
                                    <textarea
                                        rows="6"
                                        placeholder="Write your prompt here. Be specific and provide clear instructions for the AI model."
                                        className="w-full p-4 outline-none resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2 font-medium">Tags</label>
                                <input
                                    type="text"
                                    placeholder="Add tags separated by commas (e.g., productivity, writing, coding)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                />
                            </div>

                            <div className="flex justify-between">
                                <div className="flex items-center">
                                    <input type="checkbox" id="share-publicly" className="mr-2" />
                                    <label htmlFor="share-publicly">Share publicly with the community</label>
                                </div>
                                <div className="flex gap-3">
                                    <button className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 transition">
                                        Save Draft
                                    </button>
                                    <button className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition shadow hover:shadow-md">
                                        Publish Prompt
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mb-12">
                        <h3 className="text-2xl font-bold mb-6">Test Your Prompts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Next: "Add ability to save test results and export to PDF" */}
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary-600">smart_toy</span>
                                    Prompt Playground
                                </h4>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2 text-sm">
                                        Select a saved prompt or create a new one
                                    </label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition">
                                        <option>Select a prompt</option>
                                        <option>Product Description Generator</option>
                                        <option>Blog Post Outline Creator</option>
                                        <option>Code Debugger Helper</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2 text-sm">Model</label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition">
                                        <option>ChatGPT (GPT-4)</option>
                                        <option>ChatGPT (GPT-3.5)</option>
                                        <option>Claude 2</option>
                                        <option>Gemini Pro</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2 text-sm">
                                        Enter prompt variables (if any)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Variable 1: Value"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition mb-2"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Variable 2: Value"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                    />
                                </div>

                                <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition shadow hover:shadow-md flex items-center justify-center gap-2 group">
                                    <span className="material-symbols-outlined transform group-hover:rotate-45 transition-all duration-300">
                                        rocket_launch
                                    </span>
                                    Run Test & Preview Results
                                </button>
                            </div>

                            <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h4 className="font-bold text-lg flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-600">analytics</span>
                                        Results
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <button className="text-gray-500 hover:text-gray-700 transition-colors">
                                            <span className="material-symbols-outlined">content_copy</span>
                                        </button>
                                        <button className="text-gray-500 hover:text-gray-700 transition-colors">
                                            <span className="material-symbols-outlined">download</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 flex-grow bg-gray-50 rounded-b-xl relative overflow-y-auto">
                                    <div className="h-full">
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary-600">
                                                        smart_toy
                                                    </span>
                                                    <span className="font-medium">Model Response Preview</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                                                        GPT-4
                                                    </button>
                                                    <button className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                                        Claude
                                                    </button>
                                                    <button className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                                        Gemini
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white rounded-lg border border-gray-200 mb-4 hover:shadow-md transition-all">
                                                <p className="text-gray-800 text-sm">
                                                    Your product description will appear here after you run the test.
                                                    The AI will generate content based on your prompt variables and
                                                    selected model.
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <span className="material-symbols-outlined text-sm mr-1">
                                                        timer
                                                    </span>
                                                    <span>Response time: --</span>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors">
                                                        <span className="material-symbols-outlined text-sm">
                                                            refresh
                                                        </span>
                                                        Regenerate
                                                    </button>
                                                    <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors">
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                        Edit Prompt
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <div className="text-sm font-medium mb-2">Compare with other models:</div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-purple-600 text-xs">
                                                                magic_button
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-medium">Claude</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 italic">
                                                        Click to preview Claude's response
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-green-600 text-xs">
                                                                globe
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-medium">Gemini</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 italic">
                                                        Click to preview Gemini's response
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mb-12">
                        <h3 className="text-2xl font-bold mb-6">Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Next: "Add detailed feature pages with tutorials and examples" */}
                            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:-translate-y-1">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-blue-600">edit_document</span>
                                </div>
                                <h4 className="font-bold text-xl mb-2">Create</h4>
                                <p className="text-gray-600">
                                    Design powerful prompts with our intuitive editor. Add variables, formatting, and
                                    structure for consistent results.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:-translate-y-1">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-green-600">share</span>
                                </div>
                                <h4 className="font-bold text-xl mb-2">Share</h4>
                                <p className="text-gray-600">
                                    Publish your prompts to the community or keep them private. Collaborate with others
                                    to improve and iterate.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:-translate-y-1">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-purple-600">science</span>
                                </div>
                                <h4 className="font-bold text-xl mb-2">Test</h4>
                                <p className="text-gray-600">
                                    Try your prompts across different AI models. Analyze performance and refine for
                                    optimal results.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:-translate-y-1">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-yellow-600">insights</span>
                                </div>
                                <h4 className="font-bold text-xl mb-2">Analyze</h4>
                                <p className="text-gray-600">
                                    Get detailed analytics on your prompts. See how they perform and how users engage
                                    with them.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:-translate-y-1">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-red-600">group</span>
                                </div>
                                <h4 className="font-bold text-xl mb-2">Community</h4>
                                <p className="text-gray-600">
                                    Join a vibrant community of prompt engineers. Learn from experts and contribute your
                                    knowledge.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:-translate-y-1">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-indigo-600">school</span>
                                </div>
                                <h4 className="font-bold text-xl mb-2">Learn</h4>
                                <p className="text-gray-600">
                                    Access tutorials, guides and best practices on prompt engineering for different AI
                                    models and use cases.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100">
                            {/* Next: "Add testimonials carousel from community members" */}
                            <div className="text-center mb-8">
                                <h3 className="text-3xl font-bold mb-3">Join Our Community</h3>
                                <p className="text-gray-600 max-w-2xl mx-auto">
                                    Connect with thousands of prompt engineers and AI enthusiasts. Share knowledge,
                                    collaborate on projects, and stay updated on the latest LLM developments.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                    <div className="text-primary-600 text-3xl font-bold mb-2">10,000+</div>
                                    <div className="text-gray-600">Active Members</div>
                                </div>

                                <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                    <div className="text-primary-600 text-3xl font-bold mb-2">25,000+</div>
                                    <div className="text-gray-600">Shared Prompts</div>
                                </div>

                                <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                    <div className="text-primary-600 text-3xl font-bold mb-2">100,000+</div>
                                    <div className="text-gray-600">Monthly Tests</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">person_add</span>
                                    Sign Up Free
                                </button>
                                <button className="border border-primary-600 text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">play_circle</span>
                                    Watch Demo
                                </button>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="mt-16 border-t border-gray-200 pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-primary-600 text-white p-1 rounded-md">
                                    <span className="material-symbols-outlined">psychology</span>
                                </div>
                                <span className="font-bold text-xl">PromptShare</span>
                            </div>
                            <p className="text-gray-600 mb-4">
                                The platform for creating, sharing and testing LLM prompts.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors">
                                    <i className="fa-brands fa-twitter text-lg"></i>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors">
                                    <i className="fa-brands fa-discord text-lg"></i>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors">
                                    <i className="fa-brands fa-github text-lg"></i>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors">
                                    <i className="fa-brands fa-youtube text-lg"></i>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4">Platform</h4>
                            <ul className="space-y-2">
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

                        <div>
                            <h4 className="font-bold mb-4">Resources</h4>
                            <ul className="space-y-2">
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
                </footer>
            </div>
        </div>
    )
}
