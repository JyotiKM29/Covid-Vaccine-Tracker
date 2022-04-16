import numeral from "numeral"
import React from "react"
import "../Table.css"

function Table({ countries }) {
  return (
    <div className='table'>
      {countries.map(({ country, cases }) => (
        <tr>
          <td>{country}</td>
          <td>
            <strong>{numeral(cases).format("000,000")}</strong>
          </td>
        </tr>
      ))}
    </div>
  )
}

export default Table
