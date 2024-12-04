
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"
import Swal from "sweetalert2";
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
            Swal.fire({icon:'warning',title: 'Error',text: error});
            return;
        }
        try {
            console.log(email,password)
            const response = await fetch('http://localhost:3300/login', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), 
            });
            if (!response.ok) {
                throw new Error('Error en la autenticación'); // Manejo de errores
            }
            const data = await response.json(); 
            localStorage.setItem('token', data.token); 
            if(data.user.role === 5){
                navigate('/test');
            }else{
                navigate('/dashboard');
            }
            
        } catch (error) {
            console.error('Error:', error);
            setError('Credenciales inválidas'); 
            Swal.fire({icon:'error',title: 'Error',text: error});
        }
    };
    
  return (
    <>
    <div className="container-fluid vh-100 bg-dark text-light">
        <div className="logo-container p-3">
            <img src="/LOGO-DP-a-610px.png" alt="" className="logo" />
        </div>
        
        <div className=" mx-auto form w-50 border border-3 border-warning rounded-4 p-5 d-flex flex-column align-content-center justify-content-center"  >
            <form action="" className="text-center form  d-flex flex-column align-content-center justify-content-center">
                <h1 className="fw-bold">
                    Bienvenido a Atenas!
                </h1>
                <h2>
                    Ingrese sus credenciales
                </h2>
                <div className="form-group text-start">
                    <div className="input-group d-flex justify-content-center " >
                        <label htmlFor='mail' className="form-label ps-2 text-light">Correo</label>
                        <input className=" form-control" type="email" id='mail' name='mail' required value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="input-group d-flex " >
                        <label htmlFor='password' className="ps-2 text-light">Contraseña</label>
                        <input className="form-control " type="password" id='password' name='password' required value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                </div>
                <button type="submit" className="align-self-center btn-primary text-light" onClick={handleSubmit}>
                    Ingresar
                    </button>
            </form>
        </div>
    </div>
    
    </>
  )
}

export default Login;