Read `AGENTS.md` before starting.


Finally, let's add the device onboarding and polish the app.

1. Create a `DeviceSetupModal` component. Use a `useEffect` to check if `localStorage` has a `device_name`. If it does not, automatically open this Dialog (using shadcn Dialog) and ask the user to input a name (e.g., "Home Laptop"). Save it to `localStorage` along with a generated UUID.
2. Ensure this modal cannot be closed until a name is provided.
3. Review the entire app to ensure:
   - There are no hydration mismatch errors (browser APIs like `window` or `localStorage` are only accessed inside `useEffect` or event handlers).
   - All `findIndex` and `map` operations on the flattened arrays update immutable copies of the state.
   - Use GSAP to add a very subtle fade-in animation when the Dashboard loads.

### Check when done
`spec/progress-tracker.md`
