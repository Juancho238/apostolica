import Reveal from '../components/Reveal';
import {useParams,Link} from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GraduatesTable from '../components/GraduatesTable';
export default function Egresados(){const {promotion}=useParams();const match=promotion?.match(/^(?:ibaa-)?egresados-(\d{4})$/);return <div className="min-h-screen flex flex-col"><Navbar/><main className="flex-1">{promotion&&!match?<Reveal className="p-12"><h1>Promoción no encontrada</h1><Link to="/ibaa/egresados">Ver egresados</Link></Reveal>:<GraduatesTable year={match?Number(match[1]):undefined}/>}</main><Footer/></div>;}
