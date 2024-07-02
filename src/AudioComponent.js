/* global chrome */
import React, { useState, useEffect } from 'react';

const AudioComponent = () => {
  const [isDelayActive, setIsDelayActive] = useState(false);

  useEffect(() => {
    // Request the current delay status when the component mounts
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getDelayStatus' }, (response) => {
        if (response) {
          setIsDelayActive(response.isActive);
        }
      });
    });
  }, []);

  const toggleDelay = () => {
    setIsDelayActive((prevState) => {
      const newState = !prevState;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleDelay', isActive: newState });
      });
      return newState;
    });
  };

  return (
    <div>
      <h1>React and Tone.js</h1>
      <button onClick={toggleDelay}>
        {isDelayActive ? 'Disable Delay' : 'Enable Delay'}
      </button>
    </div>
  );
};

export default AudioComponent;

