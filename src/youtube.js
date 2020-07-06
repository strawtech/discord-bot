import axios from 'axios';
import { youtubeAPI } from "../config.json";


export async function getVideo (search) {
	const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
			params: {
				q: search.q,
				part: 'snippet',
				maxResults: 1,
				type: 'video',
				key: youtubeAPI,
			}
		});
		return `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`
}