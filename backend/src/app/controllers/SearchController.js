import Dev from '../models/Dev';
import parseStringAsArray from '../utils/parseStringAsArray';

class SearchController {
  /**
   * Search all developers within 10 km.
   * It also lets you filter by technologies.
   * @param {*} request 
   * @param {*} response 
   */
  async index(request, response) {
    const { latitude, longitude, techs } = request.query;

    const techsArray = parseStringAsArray(techs);

    const devs = await Dev.find({
      techs: {
        $in: techsArray,
      },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: 10000,
        },
      },
    });

    return response.json(devs);
  }
}

export default new SearchController();
