import React, { useEffect, useState } from 'react';
import Layout from '../components'
import { Container, Row, Col } from 'react-bootstrap';
import Input from '../components/UI/inputs'; // Assuming correct path to Input component
import { isUserLoggedin, login } from '../actions';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function Signin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const auth = useSelector(state=> state.auth);

    

    const userLogin = (e) => {
        e.preventDefault();
        const user = {
            email: email,
            password: password
        };

        dispatch(login(user));
    };
    if( auth.authenticate){
        return <Navigate to={'/'} />
    }
    return (
        <div>
            <Layout>
                <Container>
                    <Row style={{ marginTop: '50px' }}>
                        <Col md={{ span: 6, offset: 3 }}>
                            <form onSubmit={userLogin}>
                                <Input
                                    label="Email"
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    errorMsg=""
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    errorMsg=""
                                />
                                <div className="mb-3 form-check">
                                    <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                                    <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
                                </div>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </form>
                        </Col>
                    </Row>
                </Container>
            </Layout>
        </div>
    );
}

export default Signin;
