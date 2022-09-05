import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import AppMain from './pages/app-main/AppMain'

import 'antd/dist/antd.variable.min.css'
import { ConfigProvider } from 'antd'
import { MacroDefines } from './MacroDefines'

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

ConfigProvider.config({
    theme: {
        primaryColor: MacroDefines.PRIMARY_COLOR
    }
})

root.render(
    <AppMain />
)
