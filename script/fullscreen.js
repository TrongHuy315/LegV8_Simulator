// --- **** START: Fullscreen Functionality **** ---
export function toggleFullScreen(simulationContainer) {
    if (!document.fullscreenElement &&    // Standard property
        !document.mozFullScreenElement && // Firefox
        !document.webkitFullscreenElement && // Chrome, Safari and Opera
        !document.msFullscreenElement ) {  // IE/Edge
        if (simulationContainer.requestFullscreen) {
            simulationContainer.requestFullscreen();
        } else if (simulationContainer.mozRequestFullScreen) { /* Firefox */
            simulationContainer.mozRequestFullScreen();
        } else if (simulationContainer.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            simulationContainer.webkitRequestFullscreen();
        } else if (simulationContainer.msRequestFullscreen) { /* IE/Edge */
            simulationContainer.msRequestFullscreen();
        }
         // console.log("Entering Fullscreen");
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
        // console.log("Exiting Fullscreen");
    }
}
// --- **** END: Fullscreen Functionality **** ---
