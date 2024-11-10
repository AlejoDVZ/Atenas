
import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import "./Login.css"


export const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Para manejar errores
    const navigate = useNavigate();

    const handleSubmit = async (e) => {

        e.preventDefault(); // Previene la acción por defecto del formulario
        // Validar que los campos no estén vacíos
        if (!email || !password) {
            setError('Campos incompletos');
            console.log(error)
            alert('Por favor, complete todos los campos.');
             // Mensaje de error
            return;
        }
        // Aquí puedes hacer la solicitud a la API
        try {
            const response = await fetch('localhost:3300/login', { // Asegúrate de usar la URL correcta
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password }), // Asegúrate de enviar 'username' en lugar de 'email'
            });
            if (!response.ok) {
                throw new Error('Error en la autenticación'); // Manejo de errores
            }
            const data = await response.json();
            console.log(data); // Procesamos la respuesta
            // Aquí puedes guardar el token o la información que necesites

            // localStorage.setItem('token', data.token); // Si tu servidor devuelve un token

            // Redirigir al dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Error:', error);
            setError('Credenciales inválidas'); // Establece el mensaje de error
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