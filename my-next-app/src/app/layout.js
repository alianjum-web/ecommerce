"use client";  // Mark as a Client Component

import { Provider } from "react-redux";
import { store } from "./store.js"; // Import the Redux store

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          {children} {/* This will wrap all pages/components */}
        </Provider>
      </body>
    </html>
  );
}
