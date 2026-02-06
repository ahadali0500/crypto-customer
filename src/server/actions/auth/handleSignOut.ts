'use server'

// Custom auth - sign out is handled entirely on the client (clear localStorage, redirect)
// This export exists for compatibility with UserProfileDropdown which calls it
const handleSignOut = async () => {
    // No-op - client handles everything
}

export default handleSignOut
