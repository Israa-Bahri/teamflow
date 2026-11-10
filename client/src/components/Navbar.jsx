import { Link } from 'react-router-dom'

// "title" is a prop: a value the parent passes in, like a function argument.
function Navbar({ title }) {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">{title}</h1>
      <Link to="/login" className="text-blue-600 font-semibold">
        Login
      </Link>
    </header>
  )
}

export default Navbar