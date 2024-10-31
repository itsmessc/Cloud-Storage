import React from 'react'

const Input = (props) => {
  return (
    <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label">{props.label}</label>
        <input type={props.type} class="form-control" id={props.id} value={props.value} aria-describedby="emailHelp" onChange={props.onChange} />
        <div id="emailHelp" class="form-text">{props.errorMsg}</div>
    </div>
  )
}

export default Input