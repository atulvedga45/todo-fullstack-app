import { useState } from "react";
import axios from "axios";

function Login() {
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

const handleLogin = async (e) => {
e.preventDefault();


try {
  const response = await axios.post(
    "https://todo-fullstack-app-moqq.onrender.com/auth/login",
    {
      username,
      password,
    }
  );

  localStorage.setItem(
    "token",
    response.data.access_token
  );

  alert("Login Successful!");

  console.log(response.data);

} catch (error) {
  console.error(error);
  alert("Login Failed");
}


};

return ( <div> <h2>Login</h2>


  <form onSubmit={handleLogin}>
    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) =>
        setUsername(e.target.value)
      }
    />

    <br /><br />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) =>
        setPassword(e.target.value)
      }
    />

    <br /><br />

    <button type="submit">
      Login
    </button>
  </form>
</div>


);
}

export default Login;
