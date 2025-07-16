import axios from 'axios';

const BASE_URL = process.env.IP_API_BASE_URL;

export const fetchIpDetails = async (ip: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/${ip}`, {
      params: {
        fields: 'status,message,continent,country,countryCode,region,regionName,city,zip,lat,lon,timezone,offset,currency,org,query',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching IP info:', error.message);
    throw new Error('IP lookup failed');
  }
};
