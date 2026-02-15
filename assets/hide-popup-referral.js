/**
 * Hide Klaviyo popup for referral traffic
 * Detects URLs containing 'refr.cc' and hides the popup
 */
(function() {
    'use strict';
    
    // Check if the current URL contains refr.cc (referral traffic)
    function isReferralTraffic() {
        return window.location.href.includes('refr.cc') || 
               document.referrer.includes('refr.cc');
    }
    
    // Hide the Klaviyo popup
    function hideKlaviyoPopup() {
        // Multiple selectors to target the Klaviyo popup
        const selectors = [
            '[data-testid="POPUP"]',
            '.klaviyo-form',
            '[data-testid="klaviyo-form-XHVLtb"]',
            '.kl-private-reset-css-Xuajs1[style*="overflow: visible"]',
             '[aria-label="POPUP Form"]'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Hide the element
                element.style.display = 'none !important';
                element.style.visibility = 'hidden !important';
                element.style.opacity = '0 !important';
                
                // Also hide parent containers that might be controlling the popup
                let parent = element.parentElement;
                while (parent && parent !== document.body) {
                    if (parent.classList.contains('kl-private-reset-css-Xuajs1')) {
                        parent.style.display = 'none !important';
                        parent.style.visibility = 'hidden !important';
                        parent.style.opacity = '0 !important';
                        break;
                    }
                    parent = parent.parentElement;
                }
            });
        });
    }
    
    // Prevent Klaviyo from showing popups
    function preventKlaviyoPopups() {
        // Try to access Klaviyo's global object and disable popups
        if (window.klaviyo) {
            try {
                window.klaviyo.enable = function() { return false; };
                window.klaviyo.show = function() { return false; };
            } catch (e) {
                console.log('Could not disable Klaviyo popups via API');
            }
        }
        
        // Set a flag that other scripts can check
        window.hideKlaviyoPopups = true;
    }
    
    // Main function to run when referral traffic is detected
    function handleReferralTraffic() {
        console.log('Referral traffic detected - hiding popups');
        
        // Immediately try to hide any existing popups
        hideKlaviyoPopup();
        
        // Prevent future popups
        preventKlaviyoPopups();
        
        // Set up observers to catch popups that load later
        setupPopupObserver();
        
        // Also hide popups periodically for the first few seconds
        const intervals = [500, 1000, 2000, 3000, 5000];
        intervals.forEach(delay => {
            setTimeout(hideKlaviyoPopup, delay);
        });
    }
    
    // Set up a MutationObserver to catch dynamically added popups
    function setupPopupObserver() {
        if (typeof MutationObserver === 'undefined') return;
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if the added node or its children contain Klaviyo popup elements
                        if (node.querySelector && (
                            node.querySelector('[data-testid="POPUP"]') ||
                            node.querySelector('.klaviyo-form') ||
                            node.classList.contains('klaviyo-form') ||
                            node.hasAttribute('data-testid') && node.getAttribute('data-testid') === 'POPUP'
                        )) {
                            setTimeout(hideKlaviyoPopup, 100);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Stop observing after 30 seconds to avoid performance issues
        setTimeout(() => observer.disconnect(), 30000);
    }
    
    // Initialize the script
    function init() {
        if (isReferralTraffic()) {
            handleReferralTraffic();
        }
    }
    
    // Run immediately if DOM is ready, otherwise wait for it
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also run on window load as a fallback
    window.addEventListener('load', function() {
        if (isReferralTraffic()) {
            hideKlaviyoPopup();
        }
    });
})();
