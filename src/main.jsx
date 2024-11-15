import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Dashboard from './assets/components/UserDashboard.jsx'
import {createBrowserRouter,RouterProvider} from "react-router-dom"
import ControlPanel from './assets/components/DashboardAdmin.jsx'
import PanelControl from './assets/components/PanelControl.jsx'

const router = createBrowserRouter([
  {
    path:"/",
    element: <App/>
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
