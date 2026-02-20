/**
 * Loader.jsx — Full-screen or inline loading spinner
 */

const Loader = ({ fullScreen = false, message = 'Loading...' }) => {
    if (fullScreen) {
        return (
            <div className="loader-fullscreen">
                <div className="loader-spinner" aria-label="Loading" />
                {message && <p className="loader-msg">{message}</p>}
            </div>
        );
    }

    return (
        <div className="loader-inline">
            <div className="loader-spinner loader-spinner--sm" aria-label="Loading" />
        </div>
    );
};

export default Loader;
