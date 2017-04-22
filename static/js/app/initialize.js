import App from './components/App';

document.addEventListener('DOMContentLoaded', () => {
    // Remove Loading animation when the page is fully loaded
    $('body').addClass('loaded');

    const app = new App();
    app.start();
});
