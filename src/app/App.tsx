import { QueryClientProvider } from "@tanstack/react-query";

import { OnboardingPage } from "../features/onboarding/components/OnboardingPage";
import { queryClient } from "./queryClient";

import styles from "./App.module.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className={styles.App}>
        <OnboardingPage />
      </main>
    </QueryClientProvider>
  );
}

export default App;
