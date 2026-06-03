# Make all contact additions save to the account

**Goal**
- [x] Contacts added by business card scan, manual entry, and phone import will save to the user's account instead of only staying on the device.
- [x] All three paths will behave consistently.

**Behavior**
- [x] When the user is signed in with Google or Apple, new contacts will be saved online and remain available after reinstalling or switching devices.
- [x] If the user is using the preview email sign-in, the app will clearly keep contacts local instead of trying an online save that gets rejected.
- [x] The app will avoid showing scary background errors when online saving is not available.

**Reliability**
- [x] New contacts will still appear immediately in the app while saving happens in the background.
- [x] If an online save fails, the contact will remain safely stored on the device and the issue will be logged cleanly.
- [x] The startup sample contacts will only be saved online when the account is properly connected.

**Validation**
- [x] I’ll run the app checks after the fix and resolve any issues before reporting back.