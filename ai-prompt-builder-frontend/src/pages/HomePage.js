import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import Navbar from '../components/navbar'; // Import Navbar
import HeroSection from '../components/HeroSection';
import PromptCard from '../components/PromptCard';
import PromptFilters from '../components/PromptFilters';
import CreatePromptForm from '../components/CreatePromptForm';
import PromptTestForm from '../components/PromptTestForm';
import Footer from '../components/Footer';
// Import Auth related components and hook
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';


// This component acts as the main page layout, incorporating other components.
// It will manage state related to fetched prompts, filtering, etc., and control which section is displayed.
const HomePage = () => {
    // Access authentication state and functions from context
    const { isAuthenticated, user, login, logout, token } = useAuth(); // Get token from context

    // State to hold the list of prompts for the main view (filterable)
    const [prompts, setPrompts] = useState([]);
    // State to hold the list of prompts for the trending section (Most Viewed)
    const [mostViewedPrompts, setMostViewedPrompts] = useState([]); // State for Most Viewed prompts
    // State to hold the list of prompts for the trending section (Top Rated)
    const [topRatedPrompts, setTopRatedPrompts] = useState([]); // State for Top Rated prompts

    // State to manage loading status while fetching prompts for main list
    const [loadingPrompts, setLoadingPrompts] = useState(true);
    // State to manage loading status while fetching Most Viewed trending prompts
    const [loadingMostViewed, setLoadingMostViewed] = useState(true); // Loading state for Most Viewed
    // State to manage loading status while fetching Top Rated trending prompts
    const [loadingTopRated, setLoadingTopRated] = useState(true); // Loading state for Top Rated

    // State to hold any error message during fetching (can be shared or separate)
    const [fetchError, setFetchError] = useState(null); // Using a single error state for simplicity

    // State to manage current filter and sort options for the main list
    const [filters, setFilters] = useState({ id: '', targetModel: 'All', tags: '', isPublic: true }); // Default filters
    const [sortBy, setSortBy] = useState('created_at'); // Default sort by newest ('created_at' desc is default in backend)
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    // State to manage the search term
    const [searchTerm, setSearchTerm] = useState('');

    // State to control which main section is visible ('home', 'create', 'test', 'login', 'register')
    const [activeSection, setActiveSection] = useState('home');
    // State to hold the prompt data when a user clicks "Try It" to load into the test form
    const [promptToTest, setPromptToTest] = useState(null);
    // State to hold prompt data when user clicks "Edit Prompt"
    const [promptToEdit, setPromptToEdit] = useState(null);

    // Refs for different sections to enable scrolling
    const exploreSectionRef = useRef(null); // Ref for the "Explore All Prompts" section
    const createSectionRef = useRef(null);  // Ref for the "Create Prompt" section
    const testSectionRef = useRef(null);    // Ref for the "Test Prompt" section


    // useEffect hook to fetch prompts for the main list (filterable)
    // This runs when filters/sort options or search term change AND activeSection is 'home'
    useEffect(() => {
        const fetchMainPrompts = async () => {
            setLoadingPrompts(true); // Set loading state for main list
            // setFetchError(null); // Decide if you want to clear error here or manage separate errors

            // Construct query parameters based on current filters, sort options, and search term
            const queryParams = new URLSearchParams();
            if (filters.targetModel && filters.targetModel !== 'All') {
                queryParams.append('targetModel', filters.targetModel);
            }
            console.log(filters.id);
            if (filters.id) {
                queryParams.append('id', filters.id);
            }
            if (filters.tags) {
                queryParams.append('tags', filters.tags);
            }
            // Only append isPublic if it's false, otherwise backend defaults to true
            // If the user is authenticated, we might want to fetch their private prompts too
            if (filters.isPublic === false) {
                 queryParams.append('isPublic', false);
                 // TODO: If fetching private prompts, add author ID filter here
                 // if (isAuthenticated && user?._id) {
                 //      queryParams.append('author', user._id);
                 // }
            }
            // Add search term to query params if it exists
            if (searchTerm) {
                 queryParams.append('search', searchTerm);
            }

            // Append sort parameters for the main list
            if (sortBy === 'created_at' && sortOrder === 'asc') {
                 queryParams.set('sort', 'oldest');
            } else if (sortBy === 'title') {
                 queryParams.set('sort', sortOrder === 'asc' ? 'title_asc' : 'title_desc');
            } else {
                 queryParams.set('sort', sortBy); // Use sortBy directly for rating/views
            }

            // TODO: Implement pagination - add page and limit query params
            // queryParams.append('page', 1); // Example page 1
            // queryParams.append('limit', 10); // Example limit 10


            try {
                // Make the GET request to the backend API for the main list
                const response = await fetch(`http://localhost:5000/api/prompts?${queryParams.toString()}`); // Replace with your backend URL

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch prompts');
                }

                const data = await response.json();
                setPrompts(data.prompts); // Update main prompts state
                // TODO: Store total, page, totalPages for pagination UI

            } catch (error) {
                console.error('Error fetching main prompts:', error);
                setFetchError(`Failed to load prompts: ${error.message}`); // Set error message
            } finally {
                setLoadingPrompts(false); // Reset loading state for main list
            }
        };

        // Only fetch main prompts if the active section is 'home'
        if (activeSection === 'home') {
            fetchMainPrompts(); // Call the fetch function
        }


    }, [filters, sortBy, sortOrder, searchTerm, isAuthenticated, activeSection]); // Added activeSection as dependency


    // New useEffect hook to fetch trending prompts (Most Viewed and Top Rated)
    // This runs once when the component mounts and whenever the activeSection becomes 'home'
    useEffect(() => {
        const fetchTrendingPrompts = async () => {
            setLoadingMostViewed(true); // Set loading state for Most Viewed
            setLoadingTopRated(true); // Set loading state for Top Rated
            // setFetchError(null); // Decide if you want to clear error here or manage separate errors

            // Fetch Most Viewed Prompts
            const fetchMostViewed = async () => {
                const queryParams = new URLSearchParams();
                queryParams.append('sort', 'views'); // Sort by views
                queryParams.append('limit', 6); // Limit to 6 prompts
                queryParams.append('isPublic', true); // Only show public prompts
                try {
                    const response = await fetch(`http://localhost:5000/api/prompts?${queryParams.toString()}`);
                    if (!response.ok) {
                         const errorData = await response.json();
                         throw new Error(errorData.error || 'Failed to fetch most viewed prompts');
                    }
                    const data = await response.json();
                    setMostViewedPrompts(data.prompts);
                } catch (error) {
                    console.error('Error fetching most viewed prompts:', error);
                    setFetchError(`Failed to load trending prompts: ${error.message}`); // Use shared error state
                } finally {
                    setLoadingMostViewed(false);
                }
            };

            // Fetch Top Rated Prompts
            const fetchTopRated = async () => {
                const queryParams = new URLSearchParams();
                queryParams.append('sort', 'rating'); // Sort by rating
                queryParams.append('limit', 6); // Limit to 6 prompts
                queryParams.append('isPublic', true); // Only show public prompts
                 // Add a filter to only get prompts with at least one rating, maybe?
                 // queryParams.append('ratingsCount', {$gt: 0}); // Requires backend support for this filter
                try {
                    const response = await fetch(`http://localhost:5000/api/prompts?${queryParams.toString()}`);
                    if (!response.ok) {
                         const errorData = await response.json();
                         throw new Error(errorData.error || 'Failed to fetch top rated prompts');
                    }
                    const data = await response.json();
                    setTopRatedPrompts(data.prompts);
                } catch (error) {
                    console.error('Error fetching top rated prompts:', error);
                    setFetchError(`Failed to load trending prompts: ${error.message}`); // Use shared error state
                } finally {
                    setLoadingTopRated(false);
                }
            };

            // Execute both fetch calls concurrently
            fetchMostViewed();
            fetchTopRated();
        };

        // Fetch trending prompts when the activeSection becomes 'home'
        if (activeSection === 'home') {
             fetchTrendingPrompts();
        }

    }, [activeSection]); // Re-run when activeSection changes


    // Handler for submitting a rating from a PromptCard
    const handleRatePrompt = async (promptId, ratingValue) => {
         // Ensure user is authenticated and token is available
         if (!isAuthenticated || !token) {
             console.error("Attempted to rate without authentication.");
             // This case should ideally be handled by disabling the rating UI in PromptCard,
             // but this is a safety check.
             return Promise.reject(new Error('Authentication required to rate.')); // Return a rejected promise
         }

         try {
             const response = await fetch(`http://localhost:5000/api/prompts/${promptId}/rate`, { // Replace with your backend URL
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${token}`, // Include the JWT token
                 },
                 body: JSON.stringify({ rating: ratingValue }), // Send the rating value
             });

             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.msg || 'Failed to submit rating');
             }

             const updatedPromptData = await response.json();
             console.log('Rating submitted successfully:', updatedPromptData);

             // Update the prompts state to reflect the new rating and ratingsCount
             // Need to update ALL lists where this prompt might appear
             setPrompts(prevPrompts =>
                 prevPrompts.map(prompt =>
                     prompt._id === promptId ? { ...prompt, rating: updatedPromptData.rating, ratingsCount: updatedPromptData.ratingsCount } : prompt
                 )
             );

             setMostViewedPrompts(prevTrending =>
                  prevTrending.map(prompt =>
                      prompt._id === promptId ? { ...prompt, rating: updatedPromptData.rating, ratingsCount: updatedPromptData.ratingsCount } : prompt
                  )
             );

             setTopRatedPrompts(prevTopRated =>
                  prevTopRated.map(prompt =>
                      prompt._id === promptId ? { ...prompt, rating: updatedPromptData.rating, ratingsCount: updatedPromptData.ratingsCount } : prompt
                  )
             );


             // Return the updated prompt data or a success indicator
             return updatedPromptData;

         } catch (error) {
             console.error('Error submitting rating:', error);
             // Re-throw the error so PromptCard can handle it (e.g., display an error message)
             throw error;
         }
    };


    // Handler for filter changes from PromptFilters component
    const handleFilterChange = (newFilters) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
        // Reset to first page if pagination was implemented
        // setPage(1);
    };

    // Handler for sort changes from PromptFilters component
    const handleSortChange = (newSortBy, newSortOrder) => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        // Reset to first page if pagination was implemented
        // setPage(1);
    };

    // Handler for search action from Navbar
    const handleSearch = (term) => {
        setSearchTerm(term); // Update the search term state
        setActiveSection('home'); // Ensure we are on the home section to see results
        setPromptToTest(null); // Clear any prompt loaded for testing
        setPromptToEdit(null); // Clear any prompt loaded for editing
    };

    // Handler for going back to the main home page (top)
    const handleGoHome = () => {
         setActiveSection('home'); // Set active section to home
         setPromptToTest(null); // Clear any prompt loaded for testing
         setPromptToEdit(null); // Clear any prompt loaded for editing
         // Scroll to the top of the page
         window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    // Handler for "Create Prompt" button click in HeroSection or Navbar
    const handleCreatePromptClick = () => {
        // Check if authenticated before allowing creation
        if (isAuthenticated) {
            setActiveSection('create'); // Show the Create Prompt form section
            setPromptToTest(null); // Clear any prompt loaded for testing
            setPromptToEdit(null); // Clear any prompt loaded for editing
             // Scroll to the create section after setting the active section
             // Use a timeout to ensure the section is rendered before scrolling
             setTimeout(() => {
                  if (createSectionRef.current) {
                       createSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
             }, 100); // Adjust delay as needed

        } else {
            // If not authenticated, redirect to login (or show login modal/message)
            setActiveSection('login'); // Or show a message asking to login
            console.log("Please log in to create a prompt."); // TODO: Replace with user-friendly message
             // Optional: Scroll to login section if it has a ref
        }
    };

    // Handler for "Explore Prompts" button click in HeroSection or Navbar
    const handleExplorePromptsClick = () => {
         // Always set active section to home first, then scroll if already there
         setActiveSection('home');
         // Add a short delay before scrolling to allow the component to render
         setTimeout(() => {
              if (exploreSectionRef.current) {
                   exploreSectionRef.current.scrollIntoView({ behavior: 'smooth' });
              }
         }, 100); // Adjust delay as needed

         setPromptToTest(null); // Clear any prompt loaded for testing
         setPromptToEdit(null); // Clear any prompt loaded for editing
         // Optionally clear search term or filters when going back home from other sections
         // setSearchTerm('');
         // setFilters({ targetModel: 'All', tags: '', isPublic: true });

         // TODO: The "Explore Prompts" button should render random prompts with pagination of 10 prompt cards.
         // This will require updating the fetchPrompts logic or creating a new fetch function
         // specifically for random, paginated prompts.
    };

    // Handler for "Test Prompt" link in Navbar
    const handleTestPromptClick = () => {
        setActiveSection('test'); // Show the Test Prompts section
        setPromptToTest(null); // Start with no prompt loaded for testing
        setPromptToEdit(null); // Clear any prompt loaded for editing
         // Scroll to the test section after setting the active section
         // Use a timeout to ensure the section is rendered before scrolling
         setTimeout(() => {
              if (testSectionRef.current) {
                   testSectionRef.current.scrollIntoView({ behavior: 'smooth' });
              }
         }, 100); // Adjust delay as needed
    };

    // Handlers for switching to Login/Register sections
    const handleGoToLogin = () => {
        setActiveSection('login');
         // Optional: Scroll to login section if it has a ref
    };

    const handleGoToRegister = () => {
        setActiveSection('register');
         // Optional: Scroll to register section if it has a ref
    };


    // Handler for "Try It" button click on a PromptCard
    const handleTryItClick = (prompt) => {
        setPromptToTest(prompt); // Set the prompt data to be passed to the test form
        setActiveSection('test'); // Show the Test Prompts section
        setPromptToEdit(null); // Clear any prompt loaded for editing
         // Scroll to the test section after setting the active section
         // Use a timeout to ensure the section is rendered before scrolling
         setTimeout(() => {
              if (testSectionRef.current) {
                   testSectionRef.current.scrollIntoView({ behavior: 'smooth' });
              }
         }, 100); // Adjust delay as needed
    };

    // Handler for submitting the CreatePromptForm (for both create and edit)
    const handlePromptSaved = (savedPrompt) => { // Renamed from handlePromptCreated
        console.log('Prompt saved:', savedPrompt);
        // TODO: Optionally add the new/updated prompt to the list or refetch prompts
        // setPrompts(prevPrompts => [savedPrompt, ...prevPrompts]); // Add to the top
        // Or: fetchPrompts(); // Refetch all prompts

        // After saving, maybe navigate back to the home section or show a success message
        setActiveSection('home'); // Go back to viewing prompts
        setFetchError(null); // Clear any previous fetch error
        setPromptToEdit(null); // Clear prompt being edited
        // Trigger a refetch to include the new/updated prompt (optional)
        // fetchMainPrompts(); // Refetch main list
        // fetchTrendingPrompts(); // Refetch trending list
    };

    // Handler for cancelling the CreatePromptForm
    const handleCancelCreate = () => {
        setActiveSection('home'); // Go back to the home section
        setPromptToEdit(null); // Clear prompt being edited
    };

    // Handler for returning from the Test Prompt section
    const handleBackFromTest = () => {
        setActiveSection('home'); // Go back to the home section
        setPromptToTest(null); // Clear the prompt being tested
    };

    // Handler for "Edit Prompt" action from PromptTestForm
    const handleEditPrompt = ({ content, initialPrompt }) => { // Receives content and initialPrompt from PromptTestForm
         // Check if authenticated before allowing edit
         if (isAuthenticated) {
            setPromptToEdit({ ...initialPrompt, content: content }); // Set prompt data for editing, using current content from test form
            setActiveSection('create'); // Switch to the create/edit form section
            setPromptToTest(null); // Clear prompt being tested
             // Scroll to the create section after setting the active section
             // Use a timeout to ensure the section is rendered before scrolling
             setTimeout(() => {
                  if (createSectionRef.current) {
                       createSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
             }, 100); // Adjust delay as needed
         } else {
             // If not authenticated, redirect to login (or show login modal/message)
             setActiveSection('login'); // Or show a message asking to login
             console.log("Please log in to edit a prompt."); // TODO: Replace with user-friendly message
              // Optional: Scroll to login section if it has a ref
         }
    };

    // Handler for successful login/registration from auth forms
    const handleAuthSuccess = (authData) => {
        // The login function from useAuth will handle setting state and localStorage
        login(authData.user, authData.token);
        // After successful auth, navigate back to the home page
        setActiveSection('home');
        console.log("Authentication successful, navigating to home.");
        // Refetch prompts after login to potentially see private prompts or trigger trending fetch
        // fetchMainPrompts(); // Uncomment if you implement fetching private prompts for logged-in users
        // fetchTrendingPrompts(); // Ensure trending is also refetched
    };


    return (
        <div id="webcrumbs">
             {/* Render Navbar, passing section click handlers and search handler */}
             {/* Pass auth section handlers to Navbar */}
             {/* Pass the new handleGoHome handler to Navbar */}
             {/* isAuthenticated, user, and logout are now consumed directly by Navbar from context */}
             <Navbar
                 onCreateClick={handleCreatePromptClick}
                 onExploreClick={handleExplorePromptsClick}
                 onTestClick={handleTestPromptClick}
                 onSearch={handleSearch}
                 onGoToLogin={handleGoToLogin} // Pass handler to go to login
                 onGoToRegister={handleGoToRegister} // Pass handler to go to register
                 onGoHome={handleGoHome} // Pass the new handler for Home button/logo
                 // Removed isAuthenticated, user, and onLogout props
             />

            {/* Removed max-w-screen-xl and mx-auto from this div */}
            {/* Padding (p-4 md:p-6) remains for spacing on different screen sizes */}
            {/* Removed fixed width and mx-auto here to allow content to be fully responsive */}
            <div className="p-4 md:p-6 bg-gradient-to-br from-white to-gray-50 font-sans">

                <main>
                    {/* Hero Section is typically only on the home page */}
                    {activeSection === 'home' && (
                         <HeroSection
                             onCreatePromptClick={handleCreatePromptClick}
                             onExplorePromptsClick={handleExplorePromptsClick}
                         />
                    )}


                    {/* Conditionally render sections based on activeSection state */}
                    {activeSection === 'home' && (
                        <>
                            {/* Trending Prompts Section (Combined Most Viewed and Top Rated) */}
                            <section className="mb-12">
                                {/* Main Trending section title */}
                                <h3 className="text-2xl font-bold mb-6">Trending Prompts</h3>

                                 {/* Most Viewed Prompts Sub-section */}
                                 <p className="text-sm text-gray-600 mb-6"><span className="text-primary-600 font-medium">Most Viewed</span></p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"> {/* Added mb-8 for spacing between lists */}
                                    {loadingMostViewed && <p>Loading most viewed prompts...</p>}
                                    {/* Note: Using main fetchError for simplicity for now */}
                                    {fetchError && !loadingMostViewed && <p className="text-red-600">Error loading most viewed prompts: {fetchError}</p>}
                                    {!loadingMostViewed && !fetchError && mostViewedPrompts.length === 0 && (
                                        <p>No most viewed prompts found.</p>
                                    )}
                                    {!loadingMostViewed && !fetchError && mostViewedPrompts.length > 0 && mostViewedPrompts.map(prompt => (
                                        <PromptCard
                                            key={prompt._id}
                                            prompt={prompt}
                                            onTryItClick={handleTryItClick} // Pass handler to PromptCard
                                            onRatePrompt={handleRatePrompt} // Pass the new rating handler
                                            trendingType="most-viewed" // Indicate this is a most viewed prompt
                                        />
                                    ))}
                                </div>

                                 {/* Top Rated Prompts Sub-section */}
                                 <p className="text-sm text-gray-600 mb-6"><span className="text-primary-600 font-medium">Top-Rated</span></p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* No mb-8 on the last grid */}
                                    {loadingTopRated && <p>Loading top rated prompts...</p>}
                                    {/* Note: Using main fetchError for simplicity for now */}
                                    {fetchError && !loadingTopRated && <p className="text-red-600">Error loading top rated prompts: {fetchError}</p>}
                                    {!loadingTopRated && !fetchError && topRatedPrompts.length === 0 && (
                                        <p>No top rated prompts found.</p>
                                    )}
                                    {!loadingTopRated && !fetchError && topRatedPrompts.length > 0 && topRatedPrompts.map(prompt => (
                                        <PromptCard
                                            key={prompt._id}
                                            prompt={prompt}
                                            onTryItClick={handleTryItClick} // Pass handler to PromptCard
                                            onRatePrompt={handleRatePrompt} // Pass the new rating handler
                                            trendingType="top-rated" // Indicate this is a top rated prompt
                                        />
                                    ))}
                                </div>
                                {/* No pagination for the small trending section */}
                            </section>


                            {/* Main Prompts Section (Filterable/Sortable) - Moved to appear after Trending */}
                             <section ref={exploreSectionRef} className="mb-12"> {/* Attach the ref here */}
                                <h3 className="text-2xl font-bold mb-6">Explore All Prompts</h3> {/* New title for main section */}
                                {/* Render PromptFilters, passing filter/sort state and handlers */}
                                <PromptFilters
                                    onFilterChange={handleFilterChange}
                                    onSortChange={handleSortChange}
                                />
                                {/* Main Prompt List - Display loading, error, or prompts */}
                                {/* Grid columns are responsive: 1 col on small, 2 on md, 3 on lg */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {loadingPrompts && <p>Loading prompts...</p>}
                                    {fetchError && !loadingPrompts && <p className="text-red-600">Error loading prompts: {fetchError}</p>}
                                    {!loadingPrompts && !fetchError && prompts.length === 0 && (
                                        <p>No prompts found matching your criteria.</p>
                                    )}
                                    {!loadingPrompts && !fetchError && prompts.length > 0 && prompts.map(prompt => (
                                        <PromptCard
                                            key={prompt._id}
                                            prompt={prompt}
                                            onTryItClick={handleTryItClick} // Pass handler to PromptCard
                                            onRatePrompt={handleRatePrompt} // Pass the new rating handler
                                            // No trendingType prop for the main explore list
                                        />
                                    ))}
                                </div>
                                {/* TODO: Add Pagination controls here for the main list */}
                            </section>
                        </>
                    )}

                    {activeSection === 'create' && (
                        <>
                            {/* Create/Edit Prompt Section - Attach ref here */}
                            <section ref={createSectionRef} className="mb-12">
                                {/* Render CreatePromptForm, passing handlers and prompt data for editing */}
                                {/* Only render if authenticated */}
                                {isAuthenticated ? (
                                     <CreatePromptForm
                                         initialPromptData={promptToEdit} // Pass prompt data if editing
                                         onPromptSaved={handlePromptSaved} // Use a single handler for create/save
                                         onCancel={handleCancelCreate}
                                     />
                                ) : (
                                     // Optional: Show a message or redirect if not authenticated
                                     <div className="text-center text-gray-600">
                                         Please log in to create or edit prompts.
                                     </div>
                                )}
                            </section>
                        </>
                    )}

                     {activeSection === 'test' && (
                        <>
                            {/* Test Prompts Section - Attach ref here */}
                            <section ref={testSectionRef} className="mb-12">
                                <h3 className="text-2xl font-bold mb-6">Test Your Prompts</h3>
                                {/* Render PromptTestForm, passing the selected prompt data and handlers */}
                                <PromptTestForm
                                     initialPrompt={promptToTest}
                                     onBack={handleBackFromTest} // Handler to go back to home
                                     onEdit={handleEditPrompt} // Pass edit handler
                                />
                            </section>
                        </>
                    )}

                    {/* Login Section */}
                    {activeSection === 'login' && (
                        <>
                            <section className="mb-12">
                                {/* Render LoginForm, passing the success handler */}
                                <LoginForm onLoginSuccess={handleAuthSuccess} />
                                {/* Add a link to go to register */}
                                <p className="text-center text-gray-600 text-sm mt-4">
                                    Don't have an account? <button type="button" className="text-primary-600 hover:underline" onClick={handleGoToRegister}>Register</button>
                                </p>
                            </section>
                        </>
                    )}

                    {activeSection === 'register' && (
                        <>
                            <section className="mb-12">
                                {/* Render RegisterForm, passing the success handler */}
                                <RegisterForm onRegisterSuccess={handleAuthSuccess} />
                                {/* Add a link to go to login */}
                                <p className="text-center text-gray-600 text-sm mt-4">
                                    Already have an account? <button type="button" className="text-primary-600 hover:underline" onClick={handleGoToLogin}>Login</button>
                                </p>
                            </section>
                        </>
                    )}


                    {/* Features Section - Remains static */}
                    {activeSection === 'home' && ( // Only show features on the home section
                        <section className="mb-12">
                            <h3 className="text-2xl font-bold mb-6">Features</h3>
                            {/* Grid columns are responsive */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Keep static feature cards */}
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
                    )}


                    {/* Community Section - Remains static */}
                    {activeSection === 'home' && ( // Only show community section on the home section
                        <section>
                            <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100">
                                {/* Keep static community section JSX */}
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
                                    {/* Conditionally render Sign Up button in Community section */}
                                    {!isAuthenticated && (
                                        <button type="button" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2" onClick={handleGoToRegister}>
                                            <span className="material-symbols-outlined">person_add</span>
                                            Sign Up Free
                                        </button>
                                    )}
                                    <button type="button" className="border border-primary-600 text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">play_circle</span>
                                        Watch Demo
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                {/* Footer Component - Always visible */}
                <Footer />
            </div>
        </div>
    );
};

export default HomePage;
