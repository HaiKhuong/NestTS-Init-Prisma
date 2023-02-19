import axios from 'axios';

const ApiGraphFacebookRequest = axios.create({
  baseURL: process.env.GRAPH_FACEBOOK_API,
  headers: {
    access_token: process.env.PAGE_ACCESS_TOKEN || '',
  },
});

ApiGraphFacebookRequest.interceptors.request.use(
  async (config) => {
    return Promise.resolve(config);
  },
  (error) => Promise.reject(error),
);

export { ApiGraphFacebookRequest };
