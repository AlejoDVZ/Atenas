import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Dashboard from './assets/components/UserDashboard.jsx'
import {createBrowserRouter,RouterProvider} from "react-router-dom"

const router = createBrowserRouter([
  {
    path:"/Login",
    element: <App/>
  },
  {
    path:"/Dashboard",
    element: <Dashboard/>
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
