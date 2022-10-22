function Header({title}) {
return (
<header id="header">
  <h1>{title ? title : 'SALAHEDDINE EL FARISSI'}</h1>
</header>
)
}

export default function HomePage() {
const names = ['Choix d\'une base de données chronologique pour l\'ingestion des données IoT', 'Dév. d\'un OpenBIM pour les capteurs d\'auscultation conformément au standard IFC'];
return (
<div>
  <Header />
  <ul>
    {names.map((name) => (
    <li key={name}>{name}</li>
    ))}
  </ul>
</div>
)
}