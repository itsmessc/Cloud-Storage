import React, { useState } from 'react'
import Layout from '../../components'
import { Container,Row,Col } from 'react-bootstrap'
import Input from '../../components/UI/inputs'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { signup } from '../../actions'

function Signup(props) {
    const auth = useSelector(state=> state.auth);

    const [frstname,setfname]=useState('');
    const [lstname,setlname]=useState('');
    const [email,setemail]=useState('');
    const [password,setpassword]=useState('');
    const [confirmpassword,setconfirmpassword]=useState('');
    const [error,seterror]=useState('');
    const user =useSelector(state=> state.user);
    const dispatch = useDispatch();


    const userSignup = (e) => {
        e.preventDefault();
        const user = {
            firstname: frstname,
            lastname:lstname,
            email,
            password
        }
        dispatch(signup(user));
    }

    
    if( auth.authenticate){
        return <Navigate to={'/'} />
    }

    if(user.loading){
        return <p>Loading....!</p>
    }

  return (
    <div>
            <Layout>
                <Container>
                    {user.message}
                    <Row style={{marginTop:'50px'}}>
                        <Col md={{span:6,offset:3}}>
                        <form onSubmit={userSignup}>
                            <Row>
                                <Col md={6}>
                                    <Input
                                        label="First Name"
                                        type="text"
                                        id="fname"
                                        errorMsg=""
                                        value={frstname}
                                        onChange={(e)=>setfname(e.target.value)}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Input
                                        label="Last Name"
                                        type="text"
                                        id="lname"
                                        value={lstname}
                                        errorMsg=""
                                        onChange={(e)=>setlname(e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Input
                                label="Email"
                                type="email"
                                id="emailid"
                                value={email}
                                errorMsg="We'll never share your email with anyone else."
                                onChange={(e)=>setemail(e.target.value)}
                            />
                            <Input
                                label="Password"
                                type="password"
                                id="userpassword"
                                value={password}
                                errorMsg=""
                                onChange={(e)=>setpassword(e.target.value)}
                            />
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="exampleCheck1" />
                            <label class="form-check-label" for="exampleCheck1">Check me out</label>
                        </div>
                        <button type="submit" class="btn btn-primary">Submit</button>
                        </form>
                        </Col>
                    </Row>
                </Container>
            </Layout>
        </div>
  )
}

export default Signup