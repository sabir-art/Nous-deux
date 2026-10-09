import HouseApp from './house-app';
import AccessForm from './access-form';
import {getHouseUser} from '../lib/house-auth';
export const dynamic='force-dynamic';
export default async function Page(){return await getHouseUser()?<HouseApp/>:<AccessForm/>;}
