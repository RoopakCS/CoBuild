import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios"

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

    const [navigate, useNavigate] = useNavigate()

    const handleSubmit = async(e) => {
        e.preventDefault();

        try {
            setError("")

			const response = await api.post("/auth/login", {
				email, password
			})

			console.log(response.data)

			localStorage.setItem
        } catch (error) {
            
        }
    } 

	return (
		<div>
			<h1>Login</h1>

			<form onSubmit={handleSubmit}>
				<div>
					<label>Email</label>

					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>

				<div>
					<label>Password</label>

					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				{error && <p>{error}</p>}

				<button type="submit">Login</button>
			</form>
		</div>
	);
}
