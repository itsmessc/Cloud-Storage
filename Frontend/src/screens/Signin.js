import React, { useState } from 'react';
import Layout from '../components';
import { Container, Row, Col } from 'react-bootstrap';
import Input from '../components/UI/inputs';
import { login, verifyOtp, requestOtp } from '../actions'; // Import verifyOtp and requestOtp actions
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function Signin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(''); // New state for OTP input
    const [otpRequired, setOtpRequired] = useState(false); // Track if OTP is required
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);

    const userLogin = (e) => {
        e.preventDefault();
        const user = {
            email,
            password
        };

        dispatch(login(user)).then(response => {
            if (response?.otpRequired) {
                // Set OTP required state if backend indicates it
                setOtpRequired(true);
                dispatch(requestOtp(email)); // Request OTP if login requires it
            }
        });
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        dispatch(verifyOtp({ email, otp }));
    };

    if (auth.authenticate) {
        return <Navigate to={'/'} />;
    }

    return (
        <div>
            <Layout>
                <Container>
                    <Row style={{ marginTop: '50px' }}>
                        <Col md={{ span: 6, offset: 3 }}>
                            {otpRequired ? (
                                <form onSubmit={handleOtpSubmit}>
                                    <Input
                                        label="Enter OTP"
                                        type="text"
                                        id="otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        errorMsg=""
                                    />
                                    <button type="submit" className="btn btn-primary">Verify OTP</button>
                                </form>
                            ) : (
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
                                    <button type="submit" className="btn btn-primary">Login</button>
                                </form>
                            )}
                        </Col>
                    </Row>
                </Container>
            </Layout>
        </div>
    );
}

export default Signin;
