import { ReS, ReE } from '../Services/service.js';
import { models } from '../lib/db.js';

const fetchData = async (req, res) => {
    const { User } = models;
    const getUser = await User.findAll({ raw: true });
    return (getUser.length > 0) ? ReS(res, getUser, 200) : ReE(res, 'Data Not Found');

}

export default fetchData;