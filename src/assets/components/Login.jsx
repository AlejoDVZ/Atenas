
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"

export const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Para manejar errores
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        if (!email || !password) {
            setError('Campos incompletos');
            console.log(error)
            alert('Por favor, complete todos los campos.');
            return;
        }
        try {
            console.log(email,password)
            const response = await fetch('http://localhost:3300/login', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password }), 
            });
            if (!response.ok) {
                throw new Error('Error en la autenticación'); // Manejo de errores
            }
            const data = await response.json(); 
            localStorage.setItem('token', data.token); 
            navigate('/dashboard');
        } catch (error) {
            console.error('Error:', error);
            setError('Credenciales inválidas'); 
            alert(error)
        }
    };
    
  return (
    <>
    <div className="logo-container">
        <img src="/LOGO-DP-a-610px.png" alt="" className="logo" />
    </div>
    
    <div className="formulario" >
    <form action="">
        <h1>
            Bienvenido a Atenas!
        </h1>
        <h2>
            Ingrese sus credenciales
        </h2>
        <div className="form-group">
        <div className="input-group" >
            <label htmlFor='mail'>Correo</label>
            <input type="text" id='mail' name='mail' required value={email} onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <div className="input-group" >
            <label htmlFor='password'>Contraseña</label>
            <input type="password" id='password' name='password' required value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div>
        </div>
        <button type="submit" onClick={handleSubmit}>
            Ingresar
            </button>
    </form>
    </div>
    </>
  )
}

export default Login;