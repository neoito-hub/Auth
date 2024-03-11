import React from "react";
import auth_fe_forgot_password from "./remote/auth_fe_forgot_password";

export default function App() {
  return (
    <div className="App" data-testid="app">
      <auth_fe_forgot_password />
    </div>
  );
}
