import React from "react";
import auth_fe_reset_password from "./remote/auth_fe_reset_password";

export default function App() {
  return (
    <div className="App" data-testid="app">
      <auth_fe_reset_password />
    </div>
  );
}
