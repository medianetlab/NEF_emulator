
// login logic
export const handleLogin = (token, setToken) => {
    localStorage.setItem('token', token);
    setToken(token);
};

// logout logic
export const handleLogout = (setToken) => {
    localStorage.removeItem('token');
    setToken(null);
};


export const handleSwaggerClick = (url) => {
    window.open(url, '_blank');
};


export const handleRedocClick = (url) => {
    window.open(url, '_blank');
};
