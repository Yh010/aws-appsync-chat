//variable to check if the web app is being run from a localhost server
// or local development environment


const islocalHost = Boolean(
    window.location.hostname === 'localhost' || window.location.hostname === '[::1]' || window.location.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
    //localhost or ipv6 or ipv4
);

// Registers the service worker for the web app
export async function register(config) {
    // Checks if it's in production and service worker is supported
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
        // Gets the public URL and checks if it matches the origin
        const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);

        if (publicUrl.origin !== window.location.origin) {
            return;
        }

        // Waits for the window 'load' event before continuing
        const loadEventListener = () => {
            return new Promise((resolve) => {
                window.addEventListener('load', resolve);
            });
        };

        await loadEventListener();

        // Service worker URL
        const swUrl = `${process.env.PUBLIC_URL}/serviceWorker.js`;

         // Checks if running on localhost or not
        if (islocalHost) {
            checkValidServiceWorker(swUrl, config);

            // Waits for service worker to be ready and logs a message
            await navigator.serviceWorker.ready;
                  console.log(
                    'This web app is being served cache-first by a service ' +
                    'worker. To learn more, visit http://bit.ly/CRA-PWA'
                );

        } else {
            registerValidSW(swUrl, config);
        }
    }   
}






// Registers a valid service worker
async function registerValidSW(swUrl, config){
    try {   
        const registration = await navigator.serviceWorker.register(swUrl);

        registration.onupdatefound = () => {
            const installWorker = registration.installing;
            if (installWorker == null) {
                return;
            }
            installWorker.onstatechange = () => {
                if (installWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                        console.log('New content is available and will be used when all tabs for this page are closed. See http://bit.ly/CRA-PWA.');
                        if (config && config.onUpdate) {
                            config.onUpdate(registration);
                        }
                    } else {
                        console.log('Content is cached for offline use.');
                        if (config && config.onSuccess) {
                            config.onSuccess(registration);
                        }
                    }
                }
            };

        };
        
    }catch(error){
        console.log('Error during service worker registration:', error);
    }
}

// Checks if the service worker is valid
async function checkValidServiceWorker(swUrl, config) {
    try {
        const response = await fetch(swUrl);
        const contentType = response.headers.get('content-type');

        if (response.status === 404 || (contentType != null && contentType.indexOf('javascript') === -1)) {
            //service worker not found so unregister the existing worker and reload page
            const registration = await navigator.serviceWorker.ready;
            await registration.unregister();
            window.location.reload();
        } else {
            //service worker found
            registerValidSW(swUrl, config);
        }
    }catch(error){
        console.log('No internet connection found. App is running in offline mode.');
    }   
}

// Unregisters the service worker

export async function unregister() { 
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.unregister();
    }
}
