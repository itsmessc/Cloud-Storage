import React from 'react'
import Layout from '../../components'
import { Row, Col,Container } from 'react-bootstrap'
import './style.css'
import { NavLink } from 'react-router-dom'
function Home() {
    return (
        <div>
            <Layout sidebar>
                {/* <div style={{margin:'5rem'}} class="p-5 mb-4 bg-white rounded-3">
                    <div class="container-fluid py-5 text-center">
                        <h1 class="display-5 fw-bold">Welcome Admin</h1>
                    </div>
                </div> */}
                
            </Layout>
        </div>
    )
}
export default Home