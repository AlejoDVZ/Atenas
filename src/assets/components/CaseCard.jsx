import React from 'react'

export const CaseCard = (casesdata) => {
    let cases = casesdata;
  return (
    {cases.map(caseItem => (
        <div key={caseItem.id} className={`case-card ${caseItem.isPrivate ? 'private' : 'public'}`}>
          <h3>Caso #{caseItem.id}</h3>
          <p>Fecha de aceptación: {caseItem.acceptanceDate}</p>
          <p>Última actualización: {caseItem.lastUpdate}</p>
          <p>Estado: {caseItem.isPrivate ? 'Privado de libertad' : 'En libertad'}</p>
        </div>
      ))}
  )
}
