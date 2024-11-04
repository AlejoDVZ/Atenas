
import "./Login.css"

export const Login = () => {
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
            <input type="mail" id='mail' name='mail' required/>
        </div>
        <div className="input-group" >
            <label htmlFor='password'>Contraseña</label>
            <input type="password" id='password' name='password' required/>
        </div>
        </div>
        <button type="button">Ingresar</button>
    </form>
    </div>
    </>
  )
}

export default Login;