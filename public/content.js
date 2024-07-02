let audioContext;
let delayNode;
let crusher;
let mediaElementSource;
let videoElement;
let isDelayActive = false; // Track the state of the delay

async function initializeAudioContext() {
  try {
    // Wait for the audio context to be available
    await new Promise((resolve) => {
      const checkAudioContext = () => {
        if (window.AudioContext || window.webkitAudioContext) {
          resolve();
        } else {
          setTimeout(checkAudioContext, 100);
        }
      };
      checkAudioContext();
    });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    videoElement = document.querySelector('video');

    if (!videoElement) {
      console.log('No video element found');
    } else {
      console.log('Audio context and video element found');
    }
  } catch (error) {
    console.error('Error initializing audio context:', error);
  }
}

async function enableDelay() {
  if (!audioContext || !videoElement) {
    await initializeAudioContext();
  }

  if (audioContext && videoElement) {
    if (!mediaElementSource) {
      mediaElementSource = Tone.context.createMediaElementSource(videoElement);
    }

    if (!delayNode) {
      delayNode = new Tone.FeedbackDelay("8n", 0.5).toDestination();
      crusher = new Tone.BitCrusher(4).toDestination();

    }

    mediaElementSource.disconnect();
    Tone.connect(mediaElementSource, delayNode);
    Tone.connect(delayNode, crusher);
    console.log('Delay enabled');
  }
}

function disableDelay() {
  if (mediaElementSource) {
    try {
      mediaElementSource.disconnect();
			Tone.connect(mediaElementSource, Tone.context.destination);
      console.log('Delay disabled');
    } catch (error) {
      console.error('Error in disableDelay:', error);
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.action === 'toggleDelay') {
      isDelayActive = message.isActive;
      if (isDelayActive) {
        enableDelay();
      } else {
        disableDelay();
      }
      sendResponse({ isActive: isDelayActive });
    } else if (message.action === 'getDelayStatus') {
      sendResponse({ isActive: isDelayActive });
    }
  } catch (error) {
    console.error('Error in message handler:', error);
  }
});

// Initialize the audio context on load
initializeAudioContext();

