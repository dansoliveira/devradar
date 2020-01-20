import mongoose from 'mongoose';
import axios from 'axios';
import Dev from '../models/Dev';
import parseStringAsArray from '../utils/parseStringAsArray';
import { findConnections, sendMessage } from '../../websocket';

class DevController {
  async index(request, response) {
    const devs = await Dev.find();

    return response.json(devs);
  }
  
  async store(request, response) {
    const { github_username, techs, latitude, longitude } = request.body;

    const devExists = await Dev.findOne({ github_username });

    if (devExists) {
      return response.status(400).json({ error: 'Dev already exists' });
    }

    const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);

    const { name = login, avatar_url, bio } = apiResponse.data;

    const techsArray = parseStringAsArray(techs);

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    }

    const dev = await Dev.create({
      github_username,
      name,
      avatar_url,
      bio,
      techs: techsArray,
      location,
    });

    const sendSocketMessageTo = findConnections(
      { latitude, longitude },
      techsArray,
    );

    sendMessage(sendSocketMessageTo, 'new-dev', dev);

    return response.json(dev);
  }

  async update(request, response) {
    const { id } = request.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({ error: 'Id is not valid' });
    }
    
    const { name, avatar_url, bio, latitude, longitude, techs } = request.body;
    
    const techsArray = parseStringAsArray(techs);

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    }

    const dev = await Dev.findByIdAndUpdate(id, {
      name,
      avatar_url,
      bio,
      techs: techsArray,
      location,
    },
    {
      new: true,
    });

    if (!dev) {
      return response.status(400).json({ error: 'Dev does not exists' });
    }

    return response.json(dev);
  }

  async destroy(request, response) {
    const { id } = request.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({ error: 'Id is not valid' });
    }
    
    const dev = await Dev.findByIdAndDelete(id);

    if (!dev) {
      return response.status(400).json({ error: 'Dev does not exists' });
    }

    return response.send();
  }
}

export default new DevController();
