import React, {useState, useCallback, useContext} from 'react'
import './Register.css'
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PasswordInput from '../PasswordInput/PasswordInput';
import { UserContext } from '../../../context/userContext';
import { Axios } from 'axios';

const Login = () => {

  const [formData, setFormData]  = useState({
    email: "",
    password: "",
  })

  const [formValidMessage, setFormValidMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate

    return (
    <div className="container form__ --100vh">
      <div className="form-container">
        <p className="title"> Login as an Admin</p>

        <form className="form">

          <div className="--dir-column">
            <label htmlFor="email">Email:</label>
            <input 
            type="email"
            className="input"
            name="email"
            placeholder="example@yahoo.com"
            required
            />
          </div>

          <div className="--dir-column">
            <label htmlFor="password">Password:</label>
            <input 
            type="password"
            className="input"
            name="password"
            placeholder="Enter your password"
            required
            />
          </div>


          <button className="--btn">Login </button>
        </form>
        <p>
          Don&apos;t have an account yet? <Link to='/'>Register</Link> {" "}
        </p>
      </div>
    </div>
  );
}

export default Login
