// src/components/ReduxProvider.tsx
"use client"; // Needed for components that use hooks like `Provider`

import { Provider } from "react-redux";
import { store, persistor } from "@/redux/store"; // Import your Redux store and persistor
import { PersistGate } from "redux-persist/integration/react"; // Import PersistGate from redux-persist

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      {/* PersistGate delays rendering until the persisted state has been retrieved and saved to Redux */}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
