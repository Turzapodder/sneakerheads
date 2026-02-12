import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from "@clerk/clerk-react";
import { Provider } from 'react-redux';
import { store } from './store/store';
import './index.css'
import App from './App.tsx'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ClerkProvider publishableKey={clerkPubKey}>
        <App />
      </ClerkProvider>
    </Provider>
  </StrictMode>,
)
