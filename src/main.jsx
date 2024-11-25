import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './assets/components/Login.jsx'
import Dashboard from './assets/components/UserDashboard.jsx'
import {createBrowserRouter,RouterProvider} from "react-router-dom"
import ControlPanel from './assets/components/DashboardAdmin.jsx'
import PanelControl from './assets/components/PanelControl.jsx'
//import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
const router = createBrowserRouter([
  {
    path:"/",
    element: <Login/>
  },
  {
    path:"/Dashboard",
    element: <Dashboard/>
  },
  {
    path:"/cp",
    element: <ControlPanel/>
  }
  ,
  {
    path:"/test",
    element: <PanelControl/>
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
