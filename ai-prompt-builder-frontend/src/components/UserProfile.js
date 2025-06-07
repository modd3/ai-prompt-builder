import React from 'react';
import PromptCard from './PromptCard'; // Import PromptCard to display user's prompts

const ProfilePage = ({ user, userPrompts, loadingUserPrompts, fetchError, onTryItClick, onRatePrompt, onCreatePromptClick }) => {
    if (!user) {
        return (
            <div className="text-center py-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Profile Not Found</h2>
                <p className="text-gray-600">Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h2>

            {/* User Info Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
                <div className="flex items-center gap-6 mb-4">
                    {/* User Avatar */}
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                        <img
                            src={user.avatarUrl || 'https://placehold.co/80x80/cccccc/000000?text=User'}
                            alt={`${user.name || 'User'} avatar`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/cccccc/000000?text=User' }}
                        />
                    </div>
                    {/* User Details */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-800">{user.name || 'User Name'}</h4>
                        <p className="text-gray-600">{user.email}</p>
                        {/* You can add more user details here if your user model supports it */}
                        {/* <p className="text-gray-600">Joined: {new Date(user.joinedDate).toLocaleDateString()}</p> */}
                    </div>
                </div>
                {/* Profile Action Buttons */}
                <div className="flex gap-4 mt-6">
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-medium transition-all hover:shadow-lg focus:outline-none">
                        Edit Profile {/* TODO: Implement edit profile functionality */}
                    </button>
                    <button
                        className="border border-gray-300 hover:border-primary-600 text-gray-700 hover:text-primary-600 px-5 py-2 rounded-lg font-medium transition-all hover:shadow focus:outline-none"
                        onClick={onCreatePromptClick} // Use the handler passed from HomePage
                    >
                        Create New Prompt
                    </button>
                </div>
            </div>

            {/* My Prompts Section */}
            <h3 className="text-2xl font-bold text-gray-800 mb-6">My Prompts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(loadingUserPrompts && !fetchError) && <p>Loading your prompts...</p>}
                {fetchError && !loadingUserPrompts && <p className="text-red-600">Error loading your prompts: {fetchError}</p>}
                {!loadingUserPrompts && !fetchError && userPrompts.length === 0 && (
                    <div className="col-span-full text-center text-gray-600 py-8">
                        <p className="mb-4">You haven't created any prompts yet.</p>
                        <button
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg focus:outline-none"
                            onClick={onCreatePromptClick}
                        >
                            Start Creating Now!
                        </button>
                    </div>
                )}
                {!loadingUserPrompts && !fetchError && userPrompts.length > 0 && userPrompts.map(prompt => (
                    <PromptCard
                        key={prompt._id}
                        prompt={prompt}
                        onTryItClick={onTryItClick}
                        onRatePrompt={onRatePrompt}
                        // Do not pass trendingType here as these are personal prompts
                    />
                ))}
            </div>
        </div>
    );
};

export default ProfilePage;
