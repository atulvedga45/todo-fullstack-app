import { useState } from "react";
import axios from "axios";

function Register() {
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

const handleRegister = async (e) => {
e.preventDefault();


try {
  const response = await axios.post(
    "https://todo-fullstack-app-1-nqk4.onrender.com/auth/register",
    {
      username,
      password,
    }
  );

  alert("User Registered Successfully!");
  console.log(response.data);
} catch (error) {
  console.error(error);
  alert("Registration Failed");
}


};

return ( <div> <h2>Register</h2>


  <form onSubmit={handleRegister}>
    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />

    <br /><br />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <br /><br />

    <button type="submit">
      Register
    </button>
  </form>
</div>

);
}

export default Register;
