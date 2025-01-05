const blacklist = new Set();

// Function to add a token to the blacklist
const addTokenToBlacklist = (token) => {
    blacklist.add(token);
};

// Function to check if a token is blacklisted
const isTokenBlacklisted = (token) => {
    return blacklist.has(token);
};

module.exports = {
    addTokenToBlacklist,
    isTokenBlacklisted,
};
