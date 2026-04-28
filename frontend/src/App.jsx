import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
        }}
      />
    </>
  );
}
